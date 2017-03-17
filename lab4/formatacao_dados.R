library(dplyr)
info.agua <- read.csv("~/Documentos/visualizacao-de-dados/lab4/data/info_agua.csv")
info.geral <- read.csv("~/Documentos/visualizacao-de-dados/lab4/data/info_geral.csv")

data <- left_join(info.agua, info.geral, by = "cod_municipio")

data.filtered <- data %>%
  select(cod_municipio, volume_agua_produzido, agua_consumida, populacao_total, Estado.x)

data.filtered <- data.filtered %>%
  mutate(
      agua_consumida_por_habitante = (agua_consumida / populacao_total) * 10
    )

write.csv(data.filtered, "~/Documentos/visualizacao-de-dados/lab4/data/dados_agua.csv", row.names = FALSE)
