export const $hipc = {
    numOfCartGene: 25,
    showAlertMessage: function (message) {
        $("#alertMessage").text(message);
        $("#alertMessage").css('color', '#5a5a5a');
        $("#alert-message-modal").modal('show');
    },
};

export const CnkbResultView = (function () {
    const CnkbResultRowView = Backbone.View.extend({
        render: function () {
            const result = this.model;

            const templateId = "#cnkb-result-row-tmpl";

            this.template = _.template($(templateId).html());
            $(this.el).append(this.template(result));
            const geneName = Encoder.htmlEncode(result.geneName);

            const numList = result.interactionNumlist;
            _.each(numList, function (aData) {
                $("#tr_" + geneName).append('<td>' + aData + '</td>');
            });


            return this;
        }
    });

    const CnkbResultView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#cnkb-result-tmpl").html()),
        render: function () {
            const selectedgenes = JSON.parse(sessionStorage.getItem("selectedGenes"));
            const selectedInteractome = JSON.parse(sessionStorage.getItem("selectedInteractome"));
            const selectedVersion = JSON.parse(sessionStorage.getItem("selectedVersion"));

            if (selectedgenes.length > $hipc.numOfCartGene) {
                const len = selectedgenes.length;
                selectedgenes.slice($hipc.numOfCartGene, len - 1);
                sessionStorage.selectedGenes = JSON.stringify(selectedgenes);
            }

            $(this.el).html(this.template({}));
            $.ajax({
                url: "cnkb/query",
                data: {
                    dataType: "interaction-result",
                    interactome: selectedInteractome,
                    version: selectedVersion,
                    selectedGenes: JSON.stringify(selectedgenes),
                    interactionLimit: 0,
                    throttle: ""
                },
                dataType: "json",
                contentType: "json",
                success: function (data) {
                    $("#cnkb_data_progress").hide();
                    const cnkbElementList = data.cnkbElementList;
                    const interactionTypes = data.interactionTypeList;
                    _.each(interactionTypes, function (aData) {
                        const type = aData.toUpperCase();
                        $('#cnkb-result-grid thead tr').append('<th>' + type + '</th>');
                    });

                    const thatEl = $("#cnkb-result-grid");
                    _.each(cnkbElementList, function (aData) {
                        new CnkbResultRowView({
                            el: $(thatEl).find("tbody"),
                            model: aData
                        }).render();

                    });

                    $('#cnkb-result-grid').dataTable({
                        "sDom": "<'fullwidth'ifrtlp>",
                        "sScrollY": "200px",
                        "bPaginate": false

                    });

                }

            }); //ajax  

            $('#cnkbExport').click(function (e) {
                e.preventDefault();
                let filters = "";
                $('input[type="checkbox"]:checked').each(function () {
                    filters = filters + ($(this).val() + ',');
                });
                if (filters.length == 0 || $.trim(filters) === 'on,') {
                    $hipc.showAlertMessage("Please select at least one row to export to a SIF file.");
                    return;
                }

                $("#interactome").val(selectedInteractome);
                $("#version").val(selectedVersion);
                $("#selectedGenes").val(filters);
                $("#interactionLimit").val("0");
                $("#throttle").val("");
                $('#cnkbExport-form').submit();

            }); //end $('#interactomeList').change()

            const getThrottleValue = function () {

                const interactionLimit = $("#cytoscape-node-limit").val();
                let filters = "";
                $('input[type="checkbox"]:checked').each(function () {
                    filters = filters + ($(this).val() + ',');
                });

                $.ajax({
                    url: "cnkb/query",
                    data: {
                        dataType: "interaction-throttle",
                        interactome: selectedInteractome,
                        version: selectedVersion,
                        selectedGenes: filters,
                        interactionLimit: interactionLimit,
                        throttle: ""
                    },
                    dataType: "json",
                    contentType: "json",
                    success: function (data) {
                        if (data != null && data.threshold != -1) {
                            if (data.threshold == 0)
                                $("#throttle-input").text("0.0");
                            else
                                $("#throttle-input").text(data.threshold);
                        } else
                            $("#throttle-input").text("e.g. 0.01");
                        $("#throttle-input").css('color', 'grey');
                    }
                });

            };

            $("#cnkb-result-grid").on("change", ":checkbox", function () {
                getThrottleValue();
            }); //end cnkb-checked

            $("#cytoscape-node-limit").change(function (evt) {
                getThrottleValue();
            });


            $('#checkbox_selectall').click(function (event) { //on click
                if (this.checked) { // check select status
                    $('.cnkb_checkbox').each(function () { //loop through each checkbox
                        this.checked = true; //select all checkboxes with class "checkbox1"              
                    });
                    getThrottleValue();
                } else {
                    $('.cnkb_checkbox').each(function () { //loop through each checkbox
                        this.checked = false; //deselect all checkboxes with class "checkbox1"                      
                    });
                    $("#throttle-input").text("e.g. 0.01");
                    $("#throttle-input").css('color', 'grey');
                }
            });


            $('#createnetwork').click(function (event) {
                event.preventDefault();
                const throttle = $("#throttle-input").text();
                const interactionLimit = $("#cytoscape-node-limit").val();

                let filters = "";
                $('input[type="checkbox"]:checked').each(function () {
                    filters = filters + ($(this).val() + ',');

                });


                if (filters.length == 0 || $.trim(filters) === 'on,') {
                    $hipc.showAlertMessage("Please select at least one row to create a network.");
                    return;
                }
                $('#createnw_progress_indicator').show();
                $.ajax({
                    url: "cnkb/network",
                    data: {
                        interactome: selectedInteractome,
                        version: selectedVersion,
                        selectedGenes: filters,
                        interactionLimit: interactionLimit,
                        throttle: throttle
                    },
                    dataType: "json",
                    contentType: "json",
                    success: function (data) {
                        $('#createnw_progress_indicator').hide();
                        if (data == null) {
                            $hipc.showAlertMessage("The network is empty.");
                            return;
                        }
                        const cnkbDescription = selectedInteractome + " (v" + selectedVersion + ")";
                        drawCNKBCytoscape(data, Encoder.htmlEncode(cnkbDescription));

                    } //end success
                }); //end ajax


            }); //end createnetwork

            return this;
        }

    });

    const drawCNKBCytoscape = function (data, description) {
        let svgHtml = "";
        const interactions = data.interactions;
        let x1 = 20 + 90 * (3 - interactions.length),
            x2 = 53 + 90 * (3 - interactions.length);
        _.each(interactions, function (aData) {
            svgHtml = svgHtml + '<rect x="' + x1 + '" y="15" width="30" height="2" fill="' + aData.color + '" stroke="grey" stroke-width="0"/><text x="' + x2 + '" y="20" fill="grey">' + aData.type + '</text>';
            x1 = x1 + aData.type.length * 11;
            x2 = x2 + aData.type.length * 11;
        });

        $.fancybox.open(
            _.template($("#cnkb-cytoscape-tmpl").html())({
                description: description,
                svgHtml: svgHtml
            }), {
                touch: false,
                'autoDimensions': false,
                'transitionIn': 'none',
                'transitionOut': 'none'
            }
        );

        const layoutName = $("#cytoscape-layouts").val();

        const cy = cytoscape({

            container: $('#cytoscape'),
            layout: {
                name: layoutName,
                fit: true,
                liveUpdate: false,
                maxSimulationTime: 4000, // max length in ms to run the layout
                stop: function () {
                    $("#cnkb_cytoscape_progress").remove();
                    this.stop();

                } // callback on layoutstop 

            },
            elements: data,
            style: cytoscape.stylesheet()
                .selector("node")
                .css({
                    "content": "data(id)",
                    "border-width": 2,
                    "labelValign": "middle",
                    "font-size": 10,
                    "width": "25px",
                    "height": "25px",
                    "background-color": "data(color)",
                    "border-color": "#555"
                })
                .selector("edge")
                .css({
                    "width": "mapData(weight, 0, 100, 1, 3)",
                    "target-arrow-shape": "circle",
                    "source-arrow-shape": "circle",
                    "line-color": "data(color)"
                })
                .selector(":selected")
                .css({
                    "background-color": "#000",
                    "line-color": "#000",
                    "source-arrow-color": "#000",
                    "target-arrow-color": "#000"
                })
                .selector(".ui-cytoscape-edgehandles-source")
                .css({
                    "border-color": "#5CC2ED",
                    "border-width": 2
                })
                .selector(".ui-cytoscape-edgehandles-target, node.ui-cytoscape-edgehandles-preview")
                .css({
                    "background-color": "#5CC2ED"
                })
                .selector("edge.ui-cytoscape-edgehandles-preview")
                .css({
                    "line-color": "#5CC2ED"
                })
                .selector("node.ui-cytoscape-edgehandles-preview, node.intermediate")
                .css({
                    "shape": "rectangle",
                    "width": 15,
                    "height": 15
                }),

            ready: function () {
                window.cy = this; // for debugging
            }
        });

        cy.on('cxttap', 'node', function () {

            $.contextMenu('destroy', '#cytoscape');
            const sym = this.data('id');
            $.contextMenu({
                selector: '#cytoscape',

                callback: function (key, options) {
                    if (!key || 0 === key.length) {
                        $.contextMenu('destroy', '#cytoscape');
                        return;
                    }

                    let linkUrl = "";
                    switch (key) {
                        case 'linkout':
                            return;
                        case 'gene':
                            linkUrl = "http://www.ncbi.nlm.nih.gov/gene?cmd=Search&term=" + sym;
                            break;
                        case 'protein':
                            linkUrl = "http://www.ncbi.nlm.nih.gov/protein?cmd=Search&term=" + sym + "&doptcmdl=GenPept";
                            break;
                        case 'pubmed':
                            linkUrl = "http://www.ncbi.nlm.nih.gov/pubmed?cmd=Search&term=" + sym + "&doptcmdl=Abstract";
                            break;
                        case 'nucleotide':
                            linkUrl = "http://www.ncbi.nlm.nih.gov/nucleotide?cmd=Search&term=" + sym + "&doptcmdl=GenBank";
                            break;
                        case 'alldatabases':
                            linkUrl = "http://www.ncbi.nlm.nih.gov/gquery/?term=" + sym;
                            break;
                        case 'structure':
                            linkUrl = "http://www.ncbi.nlm.nih.gov/structure?cmd=Search&term=" + sym + "&doptcmdl=Brief";
                            break;
                        case 'omim':
                            linkUrl = "http://www.ncbi.nlm.nih.gov/omim?cmd=Search&term=" + sym + "&doptcmdl=Synopsis";
                            break;
                        case 'genecards':
                            linkUrl = "http://www.genecards.org/cgi-bin/carddisp.pl?gene=" + sym + "&alias=yes";
                            break;
                        case 'dashboard':
                            linkUrl = "./#search/" + sym;

                    }
                    window.open(linkUrl);
                    $.contextMenu('destroy', '#cytoscape');
                },
                items: {
                    "linkout": {
                        "name": 'LinkOut'
                    },
                    "sep1": "---------",
                    "entrez": {
                        "name": "Entrez",
                        "items": {
                            "gene": {
                                "name": "Gene"
                            },
                            "protein": {
                                "name": "Protein"
                            },
                            "pubmed": {
                                "name": "PubMed"
                            },
                            "nucleotide": {
                                "name": "Nucleotide"
                            },
                            "alldatabases": {
                                "name": "All Databases"
                            },
                            "structure": {
                                "name": "Structure"
                            },
                            "omim": {
                                "name": "OMIM"
                            }
                        }
                    },
                    "genecards": {
                        "name": "GeneCards"
                    },
                    "dashboard": {
                        "name": "Dashboard"
                    }
                }
            });
        });

    };

    return CnkbResultView;
})();