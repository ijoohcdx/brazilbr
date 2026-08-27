# Incident and Rollback Checklist

1. [ ] Name incident, time, environment, commit and owner.
2. [ ] Preserve logs/evidence; do not delete data as first response.
3. [ ] Assess user/security/data/cost impact.
4. [ ] Stop only the affected flow if safe.
5. [ ] Choose Vercel rollback, Git revert, Rules rollback or no rollback; never force-push first.
6. [ ] Keep data rollback separate from code rollback.
7. [ ] Verify production smoke and authorization after mitigation.
8. [ ] Communicate status and human decisions.
9. [ ] Write root cause, residual risk and preventive test.
