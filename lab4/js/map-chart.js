var width = 500,
    height = 600;

var svg = d3.select("#chart")
    .append("svg")
    .attr('version', '1.1')
    .attr('viewBox', '0 0 '+width+' '+height)
    .attr('width', '60%')
    .attr('class', 'map-chart');

var projection = d3.geoAlbers()
    .center([-35.0, -9.0])
    .rotate([0, 0])
    .parallels([0, 0])
    .scale(2350);

var path = d3.geoPath().projection(projection);

var populacaoScale = d3.scaleSqrt();

//var demandaScale = d3.scaleLinear();

d3.queue()
    .defer(d3.json, "data/municipios_sab.json")
    .defer(d3.csv, "data/municipios_sab.csv")
    .defer(d3.json, "data/geo_br.json")
    .defer(d3.csv, "data/dados_agua.csv")
    .await(draw);

function draw(error, sab, sab_dados, brasil, dadosPopulacao) {
    if (error) throw error;

    traducao_cod = {};

    var topProdutoresAgua = dadosPopulacao.sort(function(a, b){
        return b.volume_agua_produzido - a.volume_agua_produzido;
    }).slice(0, 50).map(function(d){return +d.cod_municipio});

    var topGastadoresAgua = dadosPopulacao.sort(function(a, b){
        return b.agua_consumida_por_habitante - a.agua_consumida_por_habitante;
    }).slice(0, 50).map(function(d){return +d.cod_municipio});

    for (var i = 0; i < sab_dados.length; i++) {
        traducao_cod[sab_dados[i].GEOCODIGO] = sab_dados[i].GEOCODIGO1;
    }

        municipios = topojson.feature(sab, sab.objects.municipios_sab);

    populacaoScale
        .domain(d3.extent(dadosPopulacao.map(function(d) { return +d.populacao_total })))
        .range(["white", "#3182bd"]);

    /*demandaScale
        .domain([d3.min(dadosPopulacao, function(d) { return +d.demanda }), d3.max(dadosPopulacao, function(d) { return +d.demanda })])
        .range(d3.schemeOranges[9]);*/

    svg.selectAll(".municipios")
        .data(brasil.features)
        .enter().append("path")
        .attr("id", function(d) { return "br-"+d.properties.codigo_ibg; })
        .attr("d", path)
        .attr("fill", "#c9c9c9");

    svg.selectAll(".municipios")
        .data(municipios.features)
        .enter().append("path")
        .attr("id", function(d) { return "sab-"+traducao_cod[d.properties.ID]; })
        .attr("d", path);


    svg.selectAll(".pin")
        .data(municipios.features.filter(function(d){
            for (var i = 0; i < topProdutoresAgua.length; i++) {
                if (topProdutoresAgua[i] == +traducao_cod[d.properties.ID]) {
                    return true;
                }
            }
            return false;
        }))
        .enter().append("circle", ".pin")
        .attr("r", 5)
        .attr("transform", function(d) {
            var location = path.centroid(d);
            return "translate(" + parseInt(location[0]) + "," + parseInt(location[1]) + ")";
        })
        .attr("fill", "#d95f02");

    svg.selectAll(".pin")
        .data(municipios.features.filter(function(d){
            for (var i = 0; i < topGastadoresAgua.length; i++) {
                if (topGastadoresAgua[i] == +traducao_cod[d.properties.ID]) {
                    return true;
                }
            }
            return false;
        }))
        .enter().append("circle", ".pin")
        .attr("r", 2)
        .attr("transform", function(d) {
            var location = path.centroid(d);
            return "translate(" + parseInt(location[0]) + "," + parseInt(location[1]) + ")";
        })
        .attr("fill", "#1b9e77");

    for (var i = 0; i < dadosPopulacao.length; i++) {
        svg.select("#sab-"+dadosPopulacao[i].cod_municipio)
            .attr("fill", populacaoScale(+dadosPopulacao[i].populacao_total));
    }
}
