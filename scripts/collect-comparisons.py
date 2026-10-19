"""Explicit network collection. Refuses to overwrite a published snapshot directory.
Usage: python3 scripts/collect-comparisons.py /tmp/brasil-new-snapshots
Review differences before replacing data/snapshots and regenerating conclusions.
"""
import concurrent.futures
import datetime
import gzip
import json
import pathlib
import sys
import urllib.request

if len(sys.argv) != 2:
    raise SystemExit(__doc__)
target = pathlib.Path(sys.argv[1])
target.mkdir(parents=True, exist_ok=False)
jobs = {
    'ipca': 'https://apisidra.ibge.gov.br/values/t/1737/n1/1/v/2266/p/' + ','.join(f'{y}12' for y in range(1998, 2026)),
    'pib': 'https://apisidra.ibge.gov.br/values/t/5932/n1/1/v/6563/p/' + ','.join(f'{y}04' for y in range(1999, 2026)) + '/c11255/90707',
    'dbgg': 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.13762/dados?formato=json&dataInicial=01/12/2006&dataFinal=31/12/2025',
}
def collect(item):
    key, url = item
    request = urllib.request.Request(url, headers={'User-Agent': 'BrasilProjectResearch/1.0'})
    with urllib.request.urlopen(request, timeout=30) as response:
        raw = response.read()
    if raw[:2] == b'\x1f\x8b':
        raw = gzip.decompress(raw)
    data = json.loads(raw)
    if not isinstance(data, list) or len(data) < 2:
        raise ValueError(f'{key}: resposta sem observações')
    payload = {'source': url, 'accessedAt': datetime.datetime.now(datetime.timezone.utc).date().isoformat(), 'data': data}
    (target / f'{key}.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n')
    return f'{key}: {len(data)} registros, incluindo cabeçalho quando aplicável'
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
    for result in executor.map(collect, jobs.items()):
        print(result)
