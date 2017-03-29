cursos = ["administracao_d_cg", "administracao_n_ss", "administracao_n_cg", "agronomia_d_pl",
    "arquitetura_e_urbanismo_d_cg", "arte_e_midia_d_cg", "ciencia_da_computacao_d_cg", "ciencias_biologicas_lic_d_ct",
    "ciencias_biologicas_lic_d_pt", "ciencias_biologicas_lic_m_cz", "ciencias_biologicas_lic_n_ct",
    "ciencias_biologicas_lic_n_pt", "ciencias_contabeis_n_ss", "ciencias_economicas_m_cg", "ciencias_economicas_n_cg",
    "ciencias_sociais_lic_d_cg", "ciencias_sociais_lic_n_sm", "comunicacao_social_d_cg", "comunicacao_social_n_cg",
    "curso_sup_de_tecn_em_agroecologia_d_sm", "curso_sup_de_tecn_em_gestao_publica_n_sm", "design_d_cg",
    "educacao_do_campo_lic_d_sm", "enfermagem_d_ct", "enfermagem_d_cz", "enfermagem_d_cg",
    "eng_de_biotecnologia_e_bioprocessos_d_sm", "engenharia_agricola_d_cg", "engenharia_ambiental_d_pl",
    "engenharia_civil_d_cg", "engenharia_de_alimentos_d_pl", "engenharia_de_biossistemas_d_sm",
    "engenharia_de_materiais_d_cg", "engenharia_de_minas_d_cg", "engenharia_de_petroleo_d_cg",
    "engenharia_de_producao_d_sm", "engenharia_de_producao_d_cg", "engenharia_eletrica_cg", "engenharia_florestal_d_pt",
    "engenharia_mecanica_d_cg", "engenharia_quimica_d_cg", "estatistica_d_cg", "farmacia_d_ct", "filosofia_bac_n_cg",
    "filosofia_lic_n_cg", "fisica_lic_d_cg", "fisica_lic_d_ct", "fisica_lic_n_cz", "fisica_lic_n_ct",
    "geografia_lic_d_cg", "geografia_lic_n_cg", "geografia_licenciatura_m_cz", "geografia_licenciatura_n_cz",
    "historia_lic_d_cg", "historia_lic_d_parfor_cg", "historia_lic_m_cz", "historia_lic_n_cz", "historia_lic_n_cg",
    "letras_espanhol_licenciatura_n_cg", "letras_ling_port_ling_franc_lic_d_cg", "letras_lingua_inglesa_lic_d_cz",
    "letras_lingua_inglesa_lic_d_cg", "letras_lingua_portuguesa_lic_m_cz", "letras_lingua_portuguesa_lic_n_cz",
    "letras_lingua_portuguesa_lic_n_cg", "letras_lingua_portuguesa_lic_d_cg", "matematica_bac_d_cg",
    "matematica_lic_d_ct", "matematica_lic_d_cz", "matematica_lic_d_cg", "matematica_lic_d_parfor_cg",
    "matematica_lic_n_ct", "matematica_lic_n_cg", "medicina_d_cg", "medicina_d_cz", "medicina_veterinaria_d_pt",
    "meteorologia_d_cg", "musica_bac_d_cg", "musica_lic_d_cg", "nutricao_d_ct", "nutricao_n_ct", "odontologia_d_pt",
    "pedagogia_lic_m_cg", "pedagogia_lic_n_cg", "pedagogia_licenciatura_m_cz", "pedagogia_licenciatura_n_cz",
    "psicologia_n_cg", "quimica_lic_d_ct", "quimica_lic_n_ct", "quimica_lic_n_cz", "quimica_lic_n_parfor_cg",
    "servico_social_m_ss"];

//d3.json("http://analytics.lsd.ufcg.edu.br/pre/ciencia_da_computacao_d_cg/disciplinas", function(error, apiresponse) {
//d3.json("http://analytics.lsd.ufcg.edu.br/pre/design_d_cg/disciplinas", function(error, apiresponse) {

function draw(curso, chart) {
    d3.select("#" + chart).selectAll("*").remove();

    var width = 600,
        height = 500;

    var svg = d3.select("#" + chart)
        .append("svg")
        .attr('version', '1.1')
        .attr('viewBox', '0 0 '+width+' '+height)
        .attr('width', '90%');

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody().strength(-20))
        .force("center", d3.forceCenter(width / 2, height / 2));

    d3.json("dados_disciplinas/" + curso + ".json", function (error, apiresponse) {
        if (error) throw error;

        var links = [],
            nodesComPreRequisito = new Set();


        apiresponse.forEach(function (d) {
            d.pre_requisitos.forEach(function (p) {
                links.push({source: String(d.codigo_disciplina), target: String(p)});
                nodesComPreRequisito.add(String(d.codigo_disciplina));
            });
        });

        var nodes = apiresponse.map(function (d) {
            return {
                id: String(d.codigo_disciplina),
                codigo_departamento: d.codigo_departamento,
                nome: d.disciplina
            };
        });

        nodes.forEach(function (d) {
            if (!(nodesComPreRequisito.has(d.id))) {
                links.push({source: d.id, target: "inicio_curso"});
            }
        });

        nodes.push({
            id: "inicio_curso",
            codigo_departamento: -1,
            nome: "Início do curso"
        });

        console.dir(links);
        console.dir(nodes);

        var link = svg.append("g")
            .attr("class", "link")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr('stroke', "black");

        var node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("r", function(d){
                if (d.id == "inicio_curso") {
                    return 15;
                }
                return 5;
            })
            .attr("fill", function (d) {
                return color(d.codigo_departamento);
            })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        node.append("title")
            .text(function (d) {
                return d.nome;
            });

        simulation
            .nodes(nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(links);

        function ticked() {
            link
                .attr("x1", function (d) {
                    return d.source.x;
                })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });
            node
                .attr("cx", function (d) {
                    return d.x;
                })
                .attr("cy", function (d) {
                    return d.y;
                });
        }
    });

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

/*var sel1 = $('#options1');
var sel2 = $('#options2');
for(var i = 0; i < cursos.length; i++) {
    var opt = document.createElement('option');
    opt.innerHTML = cursos[i];
    opt.value = cursos[i];
    sel1.appendChild(opt);
    sel2.appendChild(opt);
}*/

var sel1 = document.getElementById('options1');
var sel2 = document.getElementById('options2');
for(var i = 0; i < cursos.length; i++) {
    // Create the list item:
    var item = document.createElement('li');
    var a = document.createElement('a');
    a.setAttribute("href", "#");
    a.setAttribute("onclick", "return false;");

    // Set its contents:
    a.appendChild(document.createTextNode(cursos[i]));
    item.appendChild(a);

    // Add it to the list:
    sel1.appendChild(item);

    // Create the list item:
    var item2 = document.createElement('li');
    var a2 = document.createElement('a');
    a2.setAttribute("href", "#");
    a2.setAttribute("onclick", "return false;");

    // Set its contents:
    a2.appendChild(document.createTextNode(cursos[i]));
    item2.appendChild(a2);

    // Add it to the list:
    sel2.appendChild(item2);
}

$("#options1").on('click', 'li a', function(){
    var text = $(this).text();
    if ($("#dropdown1").text() != text) {
        $("#dropdown1").html(text + '<span class="caret"></span>');
        draw(text, "chart1");
    }
});

$("#options2").on('click', 'li a', function(){
    var text = $(this).text();
    if ($("#dropdown2").text() != text) {
        $("#dropdown2").html(text + '<span class="caret"></span>');
        draw(text, "chart2");
    }
});

$("#bla").on('click', function(){
    console.log("oi");
});

draw("engenharia_eletrica_cg", "chart1");
draw("ciencia_da_computacao_d_cg", "chart2");