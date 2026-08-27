# Playbook: loop de iteração

```text
MEASURE → ANALYZE → HYPOTHESIS → CHANGE → TEST → MEASURE AGAIN
```

**Measure:** use eventos e janela definidos no Analytics Plan. **Analyze:** compare segmentos, funil, qualitative feedback e incidentes. **Hypothesis:** escreva mudança falsificável com expected result. **Change:** implemente o menor diff reversível. **Test:** rode QA, security, build, smoke e experimento. **Measure again:** compare com baseline, registre resultado e escolha continue/rollback/pivot/stop.

Não avance uma feature porque alguém a pediu sem explicar problema, segmento, métrica e custo de manutenção. Repriorize P0 (bloqueio/segurança/dados), P1 (core outcome/activation) e P2 (melhoria comprovada).
