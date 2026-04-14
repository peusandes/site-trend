"""
Trend Fidelidade — Processador de Dados
Lê os 3 Excel da Ticketmaker, processa e gera src/data.js

Uso:
    python3 scripts/process_data.py
    python3 scripts/process_data.py --excel-dir /outro/caminho --ranking-size 30
"""
import argparse
import json
import logging
import os
import sys
import tempfile
from datetime import datetime
from typing import Any, Optional

import pandas as pd

# ---------------------------------------------------------------------------
# Configuração
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

BASE_DIR    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_REF    = datetime.now()
CPF_BLOQUEADOS = {"000.000.000-00"}

EVENTOS_CONFIG: list[dict[str, str]] = [
    {"key": "retronejo", "nome": "Retronejo", "data": "21/03/2025", "status": "REALIZADA", "arquivo": "RETRONEJO.xlsx"},
    {"key": "oboe",      "nome": "Oboé",      "data": "25/04/2025", "status": "EM VENDAS", "arquivo": "Oboé.xlsx"},
    {"key": "augeboys",  "nome": "Augeboys",  "data": "22/05/2025", "status": "EM VENDAS", "arquivo": "Augeboys.xlsx"},
]

PREPOSICOES = frozenset({"de", "da", "do", "das", "dos", "e", "em", "a", "o", "as", "os"})

# ---------------------------------------------------------------------------
# Helpers puros (sem efeitos colaterais)
# ---------------------------------------------------------------------------

def to_title_case(nome: Any) -> str:
    if not nome or (isinstance(nome, float) and pd.isna(nome)):
        return ""
    palavras = str(nome).strip().lower().split()
    return " ".join(
        p.capitalize() if i == 0 or p not in PREPOSICOES else p
        for i, p in enumerate(palavras)
    )


def calcular_idade(nascimento_str: Any) -> Optional[int]:
    """Retorna idade em anos inteiros ou None se inválida/implausível."""
    if not nascimento_str or (isinstance(nascimento_str, float) and pd.isna(nascimento_str)):
        return None
    raw = str(nascimento_str).strip()
    for fmt in ("%d/%m/%Y", "%d/%m/%y"):
        try:
            nasc = datetime.strptime(raw, fmt)
            # Evita datas no futuro ou idade implausível
            if nasc >= DATA_REF:
                return None
            anos = (DATA_REF - nasc).days // 365
            return anos if 10 <= anos <= 100 else None
        except ValueError:
            continue
    return None


def normalizar_celular(cel: Any) -> str:
    if not cel or (isinstance(cel, float) and pd.isna(cel)):
        return ""
    return str(cel).strip()


def normalizar_email(email: Any) -> str:
    if not email or (isinstance(email, float) and pd.isna(email)):
        return ""
    cleaned = str(email).strip().lower()
    return cleaned if "@" in cleaned else ""


def calcular_genero(series: pd.Series) -> dict[str, Any]:
    """Conta gêneros com match exato (case-insensitive) e retorna dict."""
    lower = series.str.lower().fillna("")
    fem   = int((lower == "feminino").sum())
    masc  = int((lower == "masculino").sum())
    total = len(series)
    nao_inf = total - fem - masc
    pct = lambda n: round(n / total * 100, 1) if total else 0.0
    return {
        "feminino":    fem,
        "masculino":   masc,
        "naoInformado": nao_inf,
        "pctFeminino": pct(fem),
        "pctMasculino": pct(masc),
    }


# ---------------------------------------------------------------------------
# Processamento vetorizado com pandas groupby
# ---------------------------------------------------------------------------

def processar_evento(config: dict, excel_dir: str, ranking_size: int) -> tuple[dict, pd.DataFrame]:
    """
    Retorna (resultado_serializado, dataframe_agregado_por_cpf).
    O DataFrame é usado pelo ranking global, evitando reprocessar.
    """
    caminho = os.path.join(excel_dir, config["arquivo"])
    if not os.path.exists(caminho):
        raise FileNotFoundError(f"Arquivo não encontrado: {caminho}")

    log.info("Lendo %-12s → %s", config["nome"], caminho)
    df = pd.read_excel(caminho, dtype=str)
    df.columns = [c.strip().upper() for c in df.columns]

    colunas_necessarias = {"CPF", "NOME TITULAR", "SEXO", "NASCIMENTO", "EMAIL", "CELULAR"}
    faltando = colunas_necessarias - set(df.columns)
    if faltando:
        raise ValueError(f"{config['nome']}: colunas ausentes: {faltando}")

    # ---------- Limpeza ----------
    df["CPF"] = df["CPF"].str.strip()
    antes = len(df)
    df = df[df["CPF"].notna() & (df["CPF"] != "") & ~df["CPF"].isin(CPF_BLOQUEADOS)]
    filtrados = antes - len(df)
    if filtrados:
        log.warning("  %d linhas filtradas (CPF inválido/bloqueado)", filtrados)

    total_ingressos = len(df)

    # ---------- Agregação vetorizada ----------
    # Para cada CPF, pega os dados do primeiro registro (são iguais) e conta linhas
    agg = (
        df.groupby("CPF", sort=False)
        .agg(
            nome     = ("NOME TITULAR", "first"),
            sexo     = ("SEXO",         "first"),
            nasc_raw = ("NASCIMENTO",   "first"),
            email    = ("EMAIL",        "first"),
            celular  = ("CELULAR",      "first"),
            ingressos= ("CPF",          "count"),
        )
        .reset_index()
    )

    # Aplica transformações
    agg["nome"]      = agg["nome"].apply(to_title_case)
    agg["sexo"]      = agg["sexo"].fillna("Não Informado").str.strip()
    agg["email"]     = agg["email"].apply(normalizar_email)
    agg["celular"]   = agg["celular"].apply(normalizar_celular)
    agg["nascimento"]= agg["nasc_raw"].fillna("").str.strip()
    agg["idade"]     = agg["nasc_raw"].apply(calcular_idade)
    agg.drop(columns=["nasc_raw"], inplace=True)

    total_pessoas = len(agg)

    # ---------- Estatísticas ----------
    idades_validas = agg["idade"].dropna()
    idade_media = round(float(idades_validas.mean()), 1) if not idades_validas.empty else 0.0
    genero = calcular_genero(agg["sexo"])

    # Qualidade dos dados
    sem_email = int(agg["email"].eq("").sum())
    sem_idade = int(agg["idade"].isna().sum())
    if sem_email or sem_idade:
        log.warning("  QA %s — sem e-mail: %d  |  sem idade: %d", config["nome"], sem_email, sem_idade)

    # ---------- Ranking ----------
    ranking_df = agg.nlargest(ranking_size, "ingressos")
    ranking = ranking_df.to_dict("records")
    # Converte NaN/None para tipos serializáveis
    for p in ranking:
        p["idade"] = int(p["idade"]) if pd.notna(p["idade"]) else None
        p["ingressos"] = int(p["ingressos"])

    log.info("  → %d ingressos | %d pessoas | %.1f anos | %d%% fem",
             total_ingressos, total_pessoas, idade_media, genero["pctFeminino"])

    resultado = {
        "key":           config["key"],
        "nome":          config["nome"],
        "data":          config["data"],
        "status":        config["status"],
        "totalIngressos": total_ingressos,
        "totalPessoas":  total_pessoas,
        "idadeMedia":    idade_media,
        "genero":        genero,
        "ranking":       ranking,
    }
    return resultado, agg


# ---------------------------------------------------------------------------
# Ranking global cross-evento
# ---------------------------------------------------------------------------

def gerar_ranking_global(
    eventos_cfg: list[dict],
    aggs: list[pd.DataFrame],
    ranking_size: int,
) -> tuple[list[dict], dict]:
    log.info("Consolidando ranking global...")

    PERFIL_COLS = ["nome", "sexo", "nascimento", "email", "celular", "idade"]

    # Empilha todos os aggs com coluna de evento e aplica groupby no CPF.
    # Estratégia: perfil = primeiro valor não-nulo por CPF; ingressos = soma por evento.
    partes = []
    for cfg, agg in zip(eventos_cfg, aggs):
        tmp = agg[["CPF", "ingressos"] + PERFIL_COLS].copy()
        tmp["_evento"] = cfg["key"]
        partes.append(tmp)

    todos = pd.concat(partes, ignore_index=True)

    # Pivot: uma coluna de ingressos por evento (NaN → 0 para CPFs ausentes)
    pivot = todos.pivot_table(
        index="CPF", columns="_evento", values="ingressos",
        aggfunc="sum", fill_value=0,
    ).reset_index()
    ing_cols = [cfg["key"] for cfg in eventos_cfg if cfg["key"] in pivot.columns]
    pivot.columns.name = None
    pivot.rename(columns={k: f"ing_{k}" for k in ing_cols}, inplace=True)

    # Perfil: primeiro valor não-nulo de cada campo por CPF
    perfil = (
        todos.groupby("CPF")[PERFIL_COLS]
        .first()
        .reset_index()
    )

    merged = perfil.merge(pivot, on="CPF", how="left")

    ing_renamed = [f"ing_{k}" for k in ing_cols]
    merged[ing_renamed] = merged[ing_renamed].fillna(0).astype(int)
    merged["totalIngressos"] = merged[ing_renamed].sum(axis=1)
    merged["numEventos"]     = (merged[ing_renamed] > 0).sum(axis=1)

    merged.sort_values("totalIngressos", ascending=False, inplace=True)
    merged.reset_index(drop=True, inplace=True)

    # ---------- Resumo global ----------
    total_pessoas = len(merged)
    total_ingressos = int(merged["totalIngressos"].sum())
    idades_validas = merged["idade"].dropna()
    idade_media = round(float(idades_validas.mean()), 1) if not idades_validas.empty else 0.0
    genero = calcular_genero(merged["sexo"].fillna("Não Informado"))

    resumo = {
        "totalPessoas":  total_pessoas,
        "totalIngressos": total_ingressos,
        "idadeMedia":    idade_media,
        "numEventos":    len(eventos_cfg),
        "genero":        genero,
    }
    log.info("  → %d pessoas únicas | %d ingressos totais", total_pessoas, total_ingressos)

    # ---------- Top N global ----------
    ranking_global = []
    for i, row in merged.head(ranking_size).iterrows():
        eventos_breakdown = {
            cfg["key"]: int(row[f"ing_{cfg['key']}"])
            for cfg in eventos_cfg
            if int(row[f"ing_{cfg['key']}"]) > 0
        }
        ranking_global.append({
            "posicao":       int(i) + 1,
            "cpf":           row["CPF"],
            "nome":          row["nome"] if pd.notna(row["nome"]) else "",
            "sexo":          row["sexo"] if pd.notna(row["sexo"]) else "Não Informado",
            "nascimento":    row["nascimento"] if pd.notna(row["nascimento"]) else "",
            "email":         row["email"] if pd.notna(row["email"]) else "",
            "celular":       row["celular"] if pd.notna(row["celular"]) else "",
            "idade":         int(row["idade"]) if pd.notna(row["idade"]) else None,
            "totalIngressos": int(row["totalIngressos"]),
            "numEventos":    int(row["numEventos"]),
            "eventos":       eventos_breakdown,
        })

    return ranking_global, resumo


# ---------------------------------------------------------------------------
# Escrita atômica do arquivo de saída
# ---------------------------------------------------------------------------

def escrever_data_js(output: dict, output_path: str) -> None:
    """Escreve via arquivo temporário e renomeia (write atômico)."""
    json_str  = json.dumps(output, ensure_ascii=False, separators=(",", ":"))
    conteudo  = (
        f"// Gerado por scripts/process_data.py em {output['geradoEm']}\n"
        f"// NÃO EDITE MANUALMENTE — re-execute o script após atualizar os Excel\n\n"
        f"export const DATA = {json_str};\n"
    )
    dir_saida = os.path.dirname(output_path)
    fd, tmp_path = tempfile.mkstemp(dir=dir_saida, suffix=".js.tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(conteudo)
        os.replace(tmp_path, output_path)   # atômico no mesmo filesystem
    except Exception:
        os.unlink(tmp_path)
        raise
    log.info("✅ data.js salvo em %s (%d bytes)", output_path, len(conteudo.encode()))


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Trend — gerador de data.js")
    parser.add_argument(
        "--excel-dir",
        default="/Users/pedrosandes/Downloads",
        help="Pasta com os arquivos .xlsx (default: ~/Downloads)",
    )
    parser.add_argument(
        "--ranking-size",
        type=int,
        default=30,
        help="Quantidade de entradas no ranking global e por evento (default: 30)",
    )
    parser.add_argument(
        "--output",
        default=os.path.join(BASE_DIR, "src", "data.js"),
        help="Caminho do arquivo de saída (default: src/data.js)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    resultados: list[dict] = []
    aggs:       list[pd.DataFrame] = []
    erros:      list[str] = []

    for config in EVENTOS_CONFIG:
        try:
            resultado, agg = processar_evento(config, args.excel_dir, args.ranking_size)
            resultados.append(resultado)
            aggs.append(agg)
        except FileNotFoundError as e:
            log.error("%s", e)
            erros.append(str(e))
        except Exception as e:
            log.exception("Erro inesperado ao processar %s", config["nome"])
            erros.append(f"{config['nome']}: {e}")

    if not resultados:
        log.critical("Nenhum evento processado com sucesso. Abortando.")
        sys.exit(1)

    if erros:
        log.warning("%d evento(s) com erro — o data.js será gerado sem eles.", len(erros))

    ranking_global, resumo = gerar_ranking_global(
        [c for c, r in zip(EVENTOS_CONFIG, [True] * len(resultados)) if r],
        aggs,
        args.ranking_size,
    )

    output = {
        "eventos":       resultados,
        "rankingGlobal": ranking_global,
        "resumo":        resumo,
        "geradoEm":      DATA_REF.strftime("%d/%m/%Y %H:%M"),
    }

    escrever_data_js(output, args.output)

    # Resumo final
    print()
    print("=" * 56)
    print(f"  {'Evento':<14} {'Ingressos':>10} {'Pessoas':>8} {'Idade Média':>12}")
    print("-" * 56)
    for ev in resultados:
        print(f"  {ev['nome']:<14} {ev['totalIngressos']:>10,} {ev['totalPessoas']:>8,} {ev['idadeMedia']:>11.1f}a")
    print("-" * 56)
    print(f"  {'TOTAL':<14} {resumo['totalIngressos']:>10,} {resumo['totalPessoas']:>8,} {resumo['idadeMedia']:>11.1f}a")
    print("=" * 56)
    if erros:
        print("\n⚠️  Erros encontrados:")
        for e in erros:
            print(f"   • {e}")


if __name__ == "__main__":
    main()
