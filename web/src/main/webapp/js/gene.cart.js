export const numOfCartGene = 25;

export function showAlertMessage(message) {
    $("#alertMessage").text(message);
    $("#alertMessage").css('color', '#5a5a5a');
    $("#alert-message-modal").modal('show');
}

//Gene List View
export const GeneListView = Backbone.View.extend({
    el: $("#main-container"),
    template: _.template($("#genelist-view-tmpl").html()),
    render: function () {

        let geneList = JSON.parse(localStorage.getItem("genelist"));
        if (geneList == null)
            geneList = [];
        else if (geneList.length > numOfCartGene) {
            const len = geneList.length;
            geneList.slice(numOfCartGene, len - 1);
            localStorage.genelist = JSON.stringify(geneList);
        }

        $(this.el).html(this.template({}));
        $.each(geneList, function (aData) {
            const value = Encoder.htmlEncode(this.toString());
            $("#geneNames").append(_.template($("#gene-cart-option-tmpl").html())({
                displayItem: value
            }));
        });

        $("#addGene").click(function (e) {
            e.preventDefault();

            $("#gene-symbols").val("");
            $("#addgene-modal").modal('show');

        });

        $("#add-gene-symbols").click(function () {
            const inputGenes = $("#gene-symbols").val();
            const genes = Encoder.htmlEncode(inputGenes).split(/[\s,]+/);

            processInputGenes(genes);

        });


        $("#deleteGene").click(function (e) {
            e.preventDefault();
            const selectedGenes = [];
            $('#geneNames :selected').each(function (i, selected) {
                selectedGenes[i] = $(selected).text();
            });

            if (selectedGenes == null || selectedGenes.length == 0) {
                showAlertMessage("You haven't select any gene!");
                return;
            }


            $.each(selectedGenes, function () {

                const gene = $.trim(this.toString()).toUpperCase();
                const index = $.inArray(gene, geneList);
                if (index >= 0) geneList.splice(index, 1);

            });
            localStorage.genelist = JSON.stringify(geneList);
            sessionStorage.selectedGenes = JSON.stringify(geneList);
            $("#geneNames option:selected").remove();


        });


        $("#clearList").click(function (e) {
            e.preventDefault();
            $('#geneNames').html('');
            localStorage.removeItem("genelist");
            sessionStorage.removeItem("selectedGenes");

            geneList = [];


        });

        $("#loadGenes").click(function (e) {
            e.preventDefault();
            $('#geneFileInput').click();

        });

        if (window.FileReader) {
            $('#geneFileInput').on('change', function (e) {
                const file = e.target.files[0];
                if (file.size > 1000) {
                    showAlertMessage("Gene Cart can only contains " + numOfCartGene + " genes.");
                    return;
                }
                const reader = new FileReader();
                reader.onload = function (e) {
                    const genes = reader.result.split(/[\s,]+/);

                    processInputGenes(genes);
                };
                reader.readAsText(file);
                $('#geneFileInput').each(function () {
                    $(this).after($(this).clone(true)).remove();
                });
            });
        } else {
            showAlertMessage("Load Genes from file is not supported.");
        }

        $("#cnkb-query").click(function (e) {

            const selectedGenes = [];
            $('#geneNames :selected').each(function (i, selected) {
                selectedGenes[i] = $(selected).text();
            });

            if (selectedGenes == null || selectedGenes.length == 0) {
                sessionStorage.selectedGenes = JSON.stringify(geneList);

            } else {
                sessionStorage.selectedGenes = JSON.stringify(selectedGenes);
            }

        });

        const processInputGenes = function (genes) {
            let geneNames = JSON.parse(localStorage.getItem("genelist"));
            if (geneNames == null)
                geneNames = [];
            const num = genes.length + geneNames.length;
            if (num > numOfCartGene) {
                showAlertMessage("Gene Cart can only contains " + numOfCartGene + " genes.");
                return;
            }

            $.ajax({
                url: "cnkb/validation",
                data: {
                    geneSymbols: JSON.stringify(genes)
                },
                dataType: "json",
                contentType: "json",
                success: function (data) {
                    let invalidGenes = "";
                    _.each(data, function (aData) {
                        if (invalidGenes.length > 0)
                            invalidGenes = aData;
                        else
                            invalidGenes = invalidGenes + ", " + aData;
                        genes.splice(genes.indexOf(aData), 1);
                    });
                    if (data.length > 1) {
                        showInvalidMessage("\"" + data + "\" are invalid and not added to the cart.");
                    } else if (data.length == 1) {
                        showInvalidMessage("\"" + data + "\" is invalid and not added to the cart.");
                    } else {
                        $("#addgene-modal").modal('hide');

                    }

                    addGenes(genes);

                }
            }); //ajax   
        };


        const addGenes = function (genes) {
            const alreadyHave = [];
            const newGenes = [];
            $.each(genes, function () {
                const eachGene = Encoder.htmlEncode($.trim(this.toString())).toUpperCase();
                if (geneList.indexOf(eachGene) > -1)
                    alreadyHave.push(eachGene);
                else if (newGenes.indexOf(eachGene.toUpperCase()) == -1 && eachGene != "") {
                    newGenes.push(eachGene);
                    geneList.push(eachGene);
                }
            });

            if (newGenes.length > 0) {
                localStorage.genelist = JSON.stringify(geneList);
                $.each(newGenes, function () {
                    const value = this.toString();
                    $("#geneNames").append(_.template($("#gene-cart-option-tmpl").html())({
                        displayItem: value
                    }));
                });

            }
        };

        return this;
    }
});

export const GeneCartHelpView = Backbone.View.extend({
    el: $("#main-container"),
    template: _.template($("#gene-cart-help-tmpl").html()),
    render: function () {
        $(this.el).html(this.template({}));
        return this;
    }
});

export const CnkbQueryView = Backbone.View.extend({
    el: $("#main-container"),
    template: _.template($("#cnkb-query-tmpl").html()),
    render: function () {
        const selectedGenes = JSON.parse(sessionStorage.getItem("selectedGenes"));
        let count = 0;
        if (selectedGenes != null)
            count = selectedGenes.length;
        let description;
        if (count == 0 || count == 1)
            description = "Query with " + count + " gene from cart";
        else
            description = "Query with " + count + " genes from cart";

        $(this.el).html(this.template({}));
        $('#queryDescription').html("");
        $('#queryDescription').html(description);
        $.ajax({
            url: "cnkb/query",
            data: {
                dataType: "interactome-context",
                interactome: "",
                version: "",
                selectedGenes: "",
                interactionLimit: 0,
                throttle: ""
            },
            dataType: "json",
            contentType: "json",
            success: function (data) {
                const list = data.interactomeList;
                _.each(list, function (aData) {
                    if (aData.toLowerCase().startsWith("preppi")) {
                        $("#interactomeList").prepend(_.template($("#gene-cart-option-tmpl-preselected").html())({
                            displayItem: aData
                        }));
                        const interactome = aData.split("(")[0].trim();
                        $.ajax({ // query the description
                            url: "cnkb/query",
                            data: {
                                dataType: "interactome-version",
                                interactome: interactome,
                                version: "",
                                selectedGenes: "",
                                interactionLimit: 0,
                                throttle: ""
                            },
                            dataType: "json",
                            contentType: "json",
                            success: function (data) {
                                $('#interactomeDescription').html("");
                                $('#interactomeDescription').html(convertUrl(data.description));
                                $('#interactomeVersionList').html("");
                                _.each(data.versionDescriptorList, function (aData) {
                                    $("#interactomeVersionList").append(_.template($("#gene-cart-option-tmpl").html())({
                                        displayItem: aData.version
                                    }));
                                });
                                $('#interactomeVersionList').disabled = false;
                                $('#selectVersion').css('color', '#5a5a5a');
                                $('#versionDescription').html("");
                            }
                        }); //ajax
                    } else
                        $("#interactomeList").append(_.template($("#gene-cart-option-tmpl").html())({
                            displayItem: aData
                        }));
                });
                $('#interactomeVersionList').disabled = true;
            }
        }); //ajax   

        let versionDescriptors;
        $('#interactomeList').change(function () {
            const selectedInteractome = $('#interactomeList option:selected').text().split("(")[0].trim();
            $.ajax({
                url: "cnkb/query",
                data: {
                    dataType: "interactome-version",
                    interactome: selectedInteractome,
                    version: "",
                    selectedGenes: "",
                    interactionLimit: 0,
                    throttle: ""
                },
                dataType: "json",
                contentType: "json",
                success: function (data) {
                    versionDescriptors = data.versionDescriptorList;
                    const description = data.description;
                    $('#interactomeDescription').html("");
                    $('#interactomeDescription').html(convertUrl(description));
                    const list = data.versionDescriptorList;
                    $('#interactomeVersionList').html("");
                    _.each(list, function (aData) {
                        $("#interactomeVersionList").append(_.template($("#gene-cart-option-tmpl").html())({
                            displayItem: aData.version
                        }));
                    });
                    $('#interactomeVersionList').disabled = false;
                    $('#selectVersion').css('color', '#5a5a5a');
                    $('#versionDescription').html("");

                }
            }); //ajax

        }); //end $('#interactomeList').change()

        $('#interactomeVersionList').change(function () {
            const selectedVersion = $('#interactomeVersionList option:selected').text().trim();
            _.each(versionDescriptors, function (aData) {
                if (aData.version === selectedVersion) {
                    $('#versionDescription').html("");
                    $('#versionDescription').html(aData.versionDesc);
                }
            });
        }); //end $('#interactomeList').change()

        $("#cnkb-result").click(function (e) {

            const selectedInteractome = $('#interactomeList option:selected').text().split("(")[0].trim();
            const selectedVersion = $('#interactomeVersionList option:selected').text().trim();

            if (selectedInteractome == null || $.trim(selectedInteractome).length == 0) {
                e.preventDefault();
                showAlertMessage("Please select an interactome name");

            } else if (selectedVersion == null || $.trim(selectedVersion).length == 0) {
                e.preventDefault();
                showAlertMessage("Please select an interactome version.");
            } else {
                sessionStorage.selectedInteractome = JSON.stringify(selectedInteractome);
                sessionStorage.selectedVersion = JSON.stringify(selectedVersion);
            }

        });

        return this;
    }
});

const CnkbResultRowView = Backbone.View.extend({
    render: function () {
        const result = this.model;

        const templateId = "#cnkb-result-row-tmpl";

        this.template = _.template($(templateId).html());
        $(this.el).append(this.template(result));

        const numList = result.interactionNumlist;
        _.each(numList, function (aData) {
            $("#tr_" + result.geneName).append('<td>' + aData + '</td>');
        });


        return this;
    }
});

export const CnkbResultView = Backbone.View.extend({
    el: $("#main-container"),
    template: _.template($("#cnkb-result-tmpl").html()),
    render: function () {
        const selectedgenes = JSON.parse(sessionStorage.getItem("selectedGenes"));
        const selectedInteractome = JSON.parse(sessionStorage.getItem("selectedInteractome"));
        const selectedVersion = JSON.parse(sessionStorage.getItem("selectedVersion"));

        if (selectedgenes.length > numOfCartGene) {
            const len = selectedgenes.length;
            selectedgenes.slice(numOfCartGene, len - 1);
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
                showAlertMessage("Please select at least one row to export to a SIF file.");
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
                showAlertMessage("Please select at least one row to create a network.");
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
                        showAlertMessage("The network is empty.");
                        return;
                    }
                    const cnkbDescription = selectedInteractome + " (v" + selectedVersion + ")";
                    drawCNKBCytoscape(data, cnkbDescription);

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

function convertUrl(description) {
    if (description.indexOf("http:") > -1) {
        const word = description.split("http:");
        let temp = $.trim(word[1]);
        if (temp.match(/.$/))
            temp = temp.substring(0, temp.length - 1);
        temp = $.trim(temp);
        const link = "<a target=\"_blank\" href=\"" + temp + "\">" + temp + "</a>";
        return word[0] + link;
    } else
        return description;
}
