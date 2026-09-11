# 이상욱 · Go Backend & Cloud Platform

Public project guides and development notes, built with Hugo and published to [GitHub Pages](https://swlee3306.github.io/sulee_portfolio/).

## Selected work

- [infra-orch-studio](https://github.com/swlee3306/infra-orch-studio): infrastructure orchestration.
- [network-collector](https://github.com/swlee3306/network-collector): OpenStack collection and APIs.
- [gitlab-mr-review-automation](https://github.com/swlee3306/gitlab-mr-review-automation): read-only input and review workflow safeguards.
- [gitops-deployment-guardrails](https://github.com/swlee3306/gitops-deployment-guardrails): static policy checks and render comparison.

## Build

Use Hugo extended 0.125.7, matching the Pages workflow:

```sh
hugo --minify --baseURL https://swlee3306.github.io/sulee_portfolio/
```

Edit content under content/. Generated public/ output is currently tracked; regenerate it with the same Hugo version. Pushes to main deploy the public static site through GitHub Actions.

Project claims must match public code. Tutorials are examples, not production benchmarks. Raw resumes, credentials, company source and real device captures do not belong in this repository.
