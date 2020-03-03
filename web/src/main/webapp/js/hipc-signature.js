(function ($) {
    // This is strictly coupled to the homepage design!
    const numOfCartGene = 25;

    // These seperators are for replacing items within the observation summary
    const leftSep = "<";
    const rightSep = ">";

    // To make URL constructing more configurable
    const CORE_API_URL = "./";

    // This is for the moustache-like templates
    // prevents collisions with JSP tags <%...%>
    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
    };

    // Get these options from the page
    const maxNumberOfEntities = $("#maxNumberOfEntites").html() * 1;

    // Datatables fix
    $.extend($.fn.dataTableExt.oStdClasses, {
        "sWrapper": "dataTables_wrapper form-inline"
    });

    $.extend(true, $.fn.dataTable.defaults, {
        "language": { // "search" -> "filter"
            "sSearch": "Filter this Table:"
        },
        "search": { // simple searching
            "smart": false
        },
        "dom": "<ifrtlp>",
    });

    // Let datatables know about our date format
    $.extend($.fn.dataTable.ext.order, {
        "dashboard-date": function (settings, col) {
            return this.api().column(col, {
                order: 'index'
            }).nodes().map(
                function (td, i) {
                    return (new Date($('a', td).html())).getTime();
                }
            );
        }
    });

    // Let datatables know about dashboard rank (for sorting)
    $.extend($.fn.dataTable.ext.order, {
        "dashboard-rank": function (settings, col) {
            return this.api().column(col, {
                order: 'index'
            }).nodes().map(
                function (td, i) {
                    return $('a', td).attr("count");
                }
            );
        }
    });

    // Let datatables know about observation count (for sorting)
    $.extend($.fn.dataTable.ext.type.order, {
        "observation-count-pre": function (d) {
            if (d == null || d == "") return 0;
            const start = d.indexOf(">");
            const end = d.indexOf("<", start);
            if (end <= start) return 0;
            const count_text = d.substring(start + 1, end);
            let count = 0;
            if (count_text != undefined) count = parseInt(count_text);
            return count;
        }
    });

    $.fn.dataTable.Api.register('order.neutral()', function () {
        return this.iterator('table', function (s) {
            s.aaSorting.length = 0;
            s.aiDisplay.sort(function (a, b) {
                return a - b;
            });
            s.aiDisplayMaster.sort(function (a, b) {
                return a - b;
            });
        });
    });

    /* Models */
    const SubmissionCenter = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/center"
    });
    const SubmissionCenters = Backbone.Collection.extend({
        url: CORE_API_URL + "list/center/?filterBy=",
        model: SubmissionCenter
    });

    const Submission = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/submission"
    });

    const CenterSubmissions = Backbone.Collection.extend({
        url: CORE_API_URL + "list/submission/?filterBy=",
        model: Submission,

        initialize: function (attributes) {
            this.url += attributes.centerId;
        }
    });

    const Observation = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/observation"
    });

    const ObservationsBySubmission = Backbone.Collection.extend({
        url: CORE_API_URL + "observations/bySubmission/?submissionId=",
        model: Observation,

        initialize: function (attributes) {
            this.url += attributes.submissionId;

            if (attributes.getAll != undefined) {
                this.url += "&getAll=" + attributes.getAll;
            }
        }
    });

    const ObservationsBySubject = Backbone.Collection.extend({
        url: CORE_API_URL + "observations/bySubject/?subjectId=",
        model: Observation,

        initialize: function (attributes) {
            this.url += attributes.subjectId;
            if (attributes.role != undefined) {
                this.url += "&role=" + attributes.role;
            }
            if (attributes.tier != undefined) {
                this.url += "&tier=" + attributes.tier;
            }

            if (attributes.getAll != undefined) {
                this.url += "&getAll=" + attributes.getAll;
            }
        }
    });

    const ObservationsFiltered = Backbone.Collection.extend({
        url: CORE_API_URL + "observations/filtered",
        model: Observation,
        initialize: function (attributes) {
            this.url += "?subjectId=" + attributes.subjectId + "&filterBy=" + attributes.filterBy;
        },
    });

    const SubjectRole = Backbone.Model.extend({});
    const SubjectRoles = Backbone.Collection.extend({
        url: CORE_API_URL + "list/role?filterBy=",
        model: SubjectRole
    });

    const ObservedEvidence = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/observedevidence"
    });

    const ObservedEvidences = Backbone.Collection.extend({
        url: CORE_API_URL + "list/observedevidence/?filterBy=",
        model: ObservedEvidence,

        initialize: function (attributes) {
            this.url += attributes.observationId;
        }
    });

    const ObservedSubject = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/observedsubject"
    });

    const ObservedSubjects = Backbone.Collection.extend({
        url: CORE_API_URL + "list/observedsubject/?filterBy=",
        model: ObservedSubject,

        initialize: function (attributes) {
            if (attributes.subjectId != undefined) {
                this.url += attributes.subjectId;
            } else {
                this.url += attributes.observationId;
            }
        }
    });

    const SearchResult = Backbone.Model.extend({});

    const SearchResults = Backbone.Collection.extend({
        url: CORE_API_URL + "search/",
        model: SearchResult,

        initialize: function (attributes) {
            this.url += encodeURIComponent(attributes.term.toLowerCase());
        }
    });

    const AnimalModel = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/animal-model"
    });

    const Gene = Backbone.Model.extend({
        urlRoot: 'get/gene',

        initialize: function (attributes) {
            this.url = this.urlRoot + "/" + attributes.species + "/" + attributes.symbol;
        }
    });

    const CellSample = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/cell-sample",
    });

    const Compound = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/compound",
    });

    const Protein = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/protein",
    });

    const ShRna = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/rna",
    });

    const TissueSample = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/tissue",
    });

    const Transcript = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/transcript",
    });

    const CellSubset = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/cell-subset"
    });

    const Pathogen = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/pathogen"
    });

    const Vaccine = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/vaccine"
    });

    const Subject = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/subject"
    });

    const SubjectWithSummaryCollection = Backbone.Collection.extend({
        url: CORE_API_URL + "explore/",

        initialize: function (attributes) {
            this.url += attributes.roles;
        }
    });

    /* Views */
    const HomeView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#home-tmpl").html()),
        render: function () {
            // Load the template
            $(this.el).html(this.template({}));

            $("#omni-search-form").submit(function () {
                window.location.hash = "search/" + $("#omni-search").val();
                return false;
            });

            $("#homepage-help-navigate").click(function (e) {
                e.preventDefault();
                (new HelpNavigateView()).render();
            });

            return this;
        }
    });

    const HelpNavigateView = Backbone.View.extend({
        template: _.template($("#help-navigate-tmpl").html()),

        render: function () {
            const content = this.template({});

            $.fancybox.open(
                content, {
                'autoDimensions': false,
                'centerOnScroll': true,
                'transitionIn': 'none',
                'transitionOut': 'none'
            }
            );

            return this;
        }
    });

    const HtmlStoryView = Backbone.View.extend({
        render: function () {
            const url = this.model.url;
            const observation = this.model.observation;

            $.post("html", {
                url: url.replace(/\\/g, '\/'), // in case data loaded from a Windows machine
            }).done(function (summary) {
                summary = summary.replace(
                    new RegExp("#submission_center", "g"),
                    "#" + observation.submission.observationTemplate.submissionCenter.stableURL
                );

                const observedSubjects = new ObservedSubjects({
                    observationId: observation.id
                });
                observedSubjects.fetch({
                    success: function () {
                        _.each(observedSubjects.models, function (observedSubject) {
                            observedSubject = observedSubject.toJSON();

                            if (observedSubject.observedSubjectRole == null || observedSubject.subject == null)
                                return;

                            summary = summary.replace(
                                new RegExp("#" + observedSubject.observedSubjectRole.columnName, "g"),
                                "#" + observedSubject.subject.stableURL
                            );
                        });

                        const observedEvidences = new ObservedEvidences({
                            observationId: observation.id
                        });
                        observedEvidences.fetch({
                            success: function () {
                                _.each(observedEvidences.models, function (observedEvidence) {
                                    observedEvidence = observedEvidence.toJSON();

                                    if (observedEvidence.observedEvidenceRole == null ||
                                        observedEvidence.evidence == null ||
                                        observedEvidence.evidence.class != "UrlEvidence") {
                                        return;
                                    }

                                    summary = summary.replace(
                                        new RegExp("#" + observedEvidence.observedEvidenceRole.columnName, "g"),
                                        observedEvidence.evidence.url.replace(/^\//, '')
                                    );
                                });

                                $.fancybox.open(
                                    _.template(
                                        $("#html-story-container-tmpl").html())({
                                            story: summary,
                                            centerName: observation.submission.observationTemplate.submissionCenter.displayName
                                        }), {
                                    'autoDimensions': false,
                                    'width': '99%',
                                    'height': '99%',
                                    'centerOnScroll': true,
                                    'transitionIn': 'none',
                                    'transitionOut': 'none'
                                }
                                );
                            }
                        });
                    }
                });
            });

            return this;

        }
    });

    const ObservationView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#observation-tmpl").html()),
        render: function () {
            const result = this.model.toJSON();
            $(this.el).html(this.template(result));

            // We will replace the values in this summary
            let summary = result.submission.observationTemplate.observationSummary;

            // Load Subjects
            const observedSubjects = new ObservedSubjects({
                observationId: result.id
            });
            const thatEl = $("#observed-subjects-grid");
            observedSubjects.fetch({
                success: function () {
                    _.each(observedSubjects.models, function (observedSubject) {
                        observedSubject = observedSubject.toJSON();

                        new ObservedSubjectSummaryRowView({
                            el: $(thatEl).find("tbody"),
                            model: observedSubject
                        }).render();


                        const subject = observedSubject.subject;
                        const thatEl2 = $("#subject-image-" + observedSubject.id);
                        let imgTemplate = $("#search-results-unknown-image-tmpl");
                        if (subject.class == "Compound") {
                            let compound = new Subject({
                                id: subject.id
                            });
                            compound.fetch({
                                success: function () {
                                    compound = compound.toJSON();
                                    _.each(compound.xrefs, function (xref) {
                                        if (xref.databaseName == "IMAGE") {
                                            compound.imageFile = xref.databaseId;
                                        }
                                    });

                                    imgTemplate = $("#search-results-compound-image-tmpl");
                                    thatEl2.append(_.template(imgTemplate.html())(compound));
                                }
                            });
                        } else if (subject.class == "AnimalModel") {
                            imgTemplate = $("#search-results-animalmodel-image-tmpl");
                            thatEl2.append(_.template(imgTemplate.html())(subject));
                        } else if (subject.class == "CellSample") {
                            imgTemplate = $("#search-results-cellsample-image-tmpl");
                            thatEl2.append(_.template(imgTemplate.html())(subject));
                        } else if (subject.class == "TissueSample") {
                            imgTemplate = $("#search-results-tissuesample-image-tmpl");
                            thatEl2.append(_.template(imgTemplate.html())(subject));
                        } else if (subject.class == "Vaccine") {
                            imgTemplate = $("#search-results-vaccine-image-tmpl");
                            thatEl2.append(_.template(imgTemplate.html())(subject));
                        } else if (subject.class == "CellSubset") {
                            imgTemplate = $("#search-results-cellsubset-image-tmpl");
                            thatEl2.append(_.template(imgTemplate.html())(subject));
                        } else if (subject.class == "Pathogen") {
                            imgTemplate = $("#search-results-pathogen-image-tmpl");
                            thatEl2.append(_.template(imgTemplate.html())(subject));
                        } else if (subject.class == "Gene") {
                            imgTemplate = $("#search-results-gene-image-tmpl");
                            thatEl2.append(_.template(imgTemplate.html())(subject));
                        } else if (subject.class == "ShRna" && subject.type.toLowerCase() == "sirna") {
                            subject.class = "SiRNA";
                            imgTemplate = $("#search-results-sirna-image-tmpl");
                            thatEl2.append(_.template(imgTemplate.html())(subject));
                        } else if (subject.class == "ShRna") {
                            imgTemplate = $("#search-results-shrna-image-tmpl");
                            thatEl2.append(_.template(imgTemplate.html())(subject));
                        } else if (subject.class == "Protein") {
                            imgTemplate = $("#search-results-protein-image-tmpl");
                            thatEl2.append(_.template(imgTemplate.html())(subject));
                        } else {
                            thatEl2.append(_.template(imgTemplate.html())(subject));
                        }

                        if (observedSubject.observedSubjectRole == null || observedSubject.subject == null)
                            return;

                        summary = summary.replace(
                            new RegExp(leftSep + observedSubject.observedSubjectRole.columnName + rightSep, "g"),
                            _.template($("#summary-subject-replacement-tmpl").html())(observedSubject.subject)
                        );

                        $("#observation-summary").html(summary);
                    });
                }
            });

            // Load evidences
            const observedEvidences = new ObservedEvidences({
                observationId: result.id
            });
            const thatEl2 = $("#observed-evidences-grid");
            observedEvidences.fetch({
                success: function () {
                    _.each(observedEvidences.models, function (observedEvidence) {
                        observedEvidence = observedEvidence.toJSON();

                        // this is getting as convoluted as it is possible to be. data model and actual requirement went totally different directions, to say the least
                        const columnName = observedEvidence.observedEvidenceRole.columnName;
                        if (columnName == 'uniqObsID') {
                            const uniqobsid = observedEvidence.displayName;
                            $("#download-signature").attr('href', './data/signature?submission=' + result.submission.id + '&uniqobsid=' + uniqobsid);
                        }

                        new ObservedEvidenceRowView({
                            el: $(thatEl2).find("tbody"),
                            model: observedEvidence
                        }).render();
                        summary = summary.replace(
                            new RegExp(leftSep + observedEvidence.observedEvidenceRole.columnName + rightSep, "g"),
                            _.template($("#summary-evidence-replacement-tmpl").html())(observedEvidence)
                        );

                        $("#observation-summary").html(summary);
                    });

                    const tableLength = (observedEvidences.models.length > 25 ? 10 : 25);
                    const oTable = $('#observed-evidences-grid').dataTable({
                        "iDisplayLength": tableLength
                    });
                    $(oTable).parent().width("100%");

                    oTable.fnSort([
                        [1, 'asc'],
                        [2, 'asc']
                    ]);

                    $('.desc-tooltip').tooltip({
                        placement: "left",
                        trigger: "hover",
                    }).on('click', function () {
                        $(this).tooltip('hide');
                    });

                    $("a.evidence-images").fancybox({
                        titlePosition: 'inside'
                    });
                    $("div.expandable").expander({
                        slicePoint: 50,
                        expandText: '[...]',
                        expandPrefix: ' ',
                        userCollapseText: '[^]'
                    });

                    $(".numeric-value").each(function (idx) {
                        const vals = $(this).html().split("e"); // capture scientific notation
                        if (vals.length > 1) {
                            $(this).html(_.template($("#observeddatanumericevidence-val-tmpl").html())({
                                firstPart: vals[0],
                                secondPart: vals[1].replace("+", "")
                            }));
                        }
                    });
                    $(".cytoscape-view").click(function (event) {
                        event.preventDefault();

                        const sifUrl = $(this).attr("data-sif-url");
                        const sifDesc = $(this).attr("data-description");
                        $.ajax({
                            url: "sif/",
                            data: {
                                url: sifUrl
                            },
                            dataType: "json",
                            contentType: "json",
                            success: function (data) {
                                $.fancybox.open(
                                    _.template($("#cytoscape-tmpl").html())({
                                        description: sifDesc
                                    }), {
                                    touch: false,
                                    'autoDimensions': false,
                                    'transitionIn': 'none',
                                    'transitionOut': 'none'
                                }
                                );

                                // load cytoscape
                                cytoscape({
                                    container: $('#cytoscape-sif'),

                                    layout: {
                                        name: 'cola',
                                        liveUpdate: false,
                                        maxSimulationTime: 1000,
                                        stop: function () {
                                            this.stop();
                                        } // callback on layoutstop 
                                    },
                                    elements: data,
                                    style: cytoscape.stylesheet()
                                        .selector("node")
                                        .css({
                                            "content": "data(id)",
                                            "border-width": 3,
                                            "background-color": "#DDD",
                                            "border-color": "#555"
                                        })
                                        .selector("edge")
                                        .css({
                                            "width": 1,
                                            "target-arrow-shape": "triangle",
                                            "source-arrow-shape": "circle",
                                            "line-color": "#444"
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
                                            "border-width": 3
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
                                        // for debugging
                                    }
                                });

                                // end load cytoscape
                            }
                        });

                    });
                }
            });

            $("#small-show-sub-details").click(function (event) {
                event.preventDefault();
                $("#obs-submission-details").slideDown();
                $("#small-show-sub-details").hide();
                $("#small-hide-sub-details").show();
            });

            const hide_submission_detail = function () {
                $("#obs-submission-details").slideUp();
                $("#small-hide-sub-details").hide();
                $("#small-show-sub-details").show();
            };
            $("#small-hide-sub-details").click(function (event) {
                event.preventDefault();
                hide_submission_detail();
            });
            hide_submission_detail();

            if (result.submission.observationTemplate.submissionDescription == "") {
                $("#obs-submission-summary").hide();
            }

            return this;
        }
    });

    const ObservedEvidenceRowView = Backbone.View.extend({
        render: function () {
            const result = this.model;
            const type = result.evidence.class;
            result.evidence.type = type;

            if (result.observedEvidenceRole == null) {
                result.observedEvidenceRole = {
                    displayText: "-",
                    evidenceRole: {
                        displayName: "unknown"
                    }
                };
            }

            let templateId = "#observedevidence-row-tmpl";
            let isHtmlStory = false;
            if (type == "FileEvidence") {
                result.evidence.filePath = result.evidence.filePath.replace(/\\/g, "/");
                if (result.evidence.mimeType.toLowerCase().search("image") > -1) {
                    templateId = "#observedimageevidence-row-tmpl";
                } else if (result.evidence.mimeType.toLowerCase().search("gct") > -1) {
                    templateId = "#observedgctfileevidence-row-tmpl";
                } else if (result.evidence.mimeType.toLowerCase().search("pdf") > -1) {
                    templateId = "#observedpdffileevidence-row-tmpl";
                } else if (result.evidence.mimeType.toLowerCase().search("sif") > -1) {
                    templateId = "#observedsiffileevidence-row-tmpl";
                } else if (result.evidence.mimeType.toLowerCase().search("html") > -1) {
                    templateId = "#observedhtmlfileevidence-row-tmpl";
                    isHtmlStory = true;
                } else {
                    templateId = "#observedfileevidence-row-tmpl";
                }
            } else if (type == "UrlEvidence") {
                templateId = "#observedurlevidence-row-tmpl";
            } else if (type == "LabelEvidence") {
                templateId = "#observedlabelevidence-row-tmpl";
            } else if (type == "DataNumericValue") {
                templateId = "#observeddatanumericevidence-row-tmpl";
            }

            this.template = _.template($(templateId).html());
            const thatEl = $(this.el);
            $(this.el).append(this.template(result));

            if (isHtmlStory) {
                thatEl.find(".html-story-link").on("click", function (e) {
                    e.preventDefault();
                    const url = $(this).attr("href");
                    (new HtmlStoryView({
                        model: {
                            observation: result.observation,
                            url: url
                        }
                    })).render();
                });
            }

            $(".img-rounded").tooltip({
                placement: "left"
            });
            return this;
        }
    });

    const CenterSubmissionRowView = Backbone.View.extend({
        template: _.template($("#center-submission-tbl-row-tmpl").html()),
        render: function () {
            $(this.el).append(this.template(this.model));
            return this;
        }
    });

    const SearchSubmissionRowView = Backbone.View.extend({
        el: "#searched-submissions tbody",
        template: _.template($("#search-submission-tbl-row-tmpl").html()),
        render: function () {
            $(this.el).append(this.template(this.model));
            return this;
        }
    });


    const SubmissionDescriptionView = Backbone.View.extend({
        el: "#optional-submission-description",
        template: _.template($("#submission-description-tmpl").html()),
        render: function () {
            $(this.el).html(this.template(this.model));
            return this;
        }
    });

    const CompoundView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#compound-tmpl").html()),
        render: function () {
            const thatModel = this.model;
            const result = thatModel.subject.toJSON();

            result.pubchem = result.cas = false;

            _.each(result.xrefs, function (xref) {
                if (xref.databaseName == "IMAGE") {
                    result.imageFile = xref.databaseId;
                } else if (xref.databaseName == "PUBCHEM") {
                    result.pubchem = xref.databaseId;
                } else if (xref.databaseName == "CAS") {
                    result.cas = xref.databaseId;
                }

            });
            result.type = result.class;

            $(this.el).html(this.template($.extend(result, {
                tier: thatModel.tier ? thatModel.tier : null,
                role: thatModel.role ? thatModel.role : null
            })));

            _.each(result.synonyms, function (aSynonym) {
                if (aSynonym.displayName == result.displayName) return;

                new SynonymView({
                    model: aSynonym,
                    el: $("ul.synonyms"),
                }).render();
            });

            new SubjectObservationsView({
                model: {
                    subjectId: result.id,
                    tier: thatModel.tier,
                    role: thatModel.role
                },
                el: "#compound-observation-grid"
            }).render();

            $("a.compound-image").fancybox({
                titlePosition: 'inside'
            });
            return this;
        }
    });

    const SubjectObservationsView = Backbone.View.extend({
        render: function () {
            const thatEl = $(this.el);
            const thatModel = this.model;
            const subjectId = thatModel.subjectId;
            const tier = thatModel.tier; // possibly undefined
            const role = thatModel.role; // possibly undefined

            let countUrl = "observations/countBySubject/?subjectId=" + subjectId;
            if (role != undefined) {
                countUrl += "&role=" + role;
            }
            if (tier != undefined) {
                countUrl += "&tier=" + tier;
            }

            $.ajax(countUrl).done(function (count) {

                if (count > maxNumberOfEntities) {
                    new MoreObservationView({
                        model: {
                            role: role,
                            tier: tier,
                            numOfObservations: maxNumberOfEntities,
                            numOfAllObservations: count,
                            subjectId: subjectId,
                            tableEl: thatEl,
                            rowView: ObservationRowView,
                            columns: [{
                                "orderDataType": "dashboard-date"
                            },
                                null,
                                null,
                                null
                            ]
                        }
                    }).render();
                }
            });

            const observations = new ObservationsBySubject({
                subjectId: subjectId,
                role: role,
                tier: tier
            });
            observations.fetch({
                success: function () {
                    $(".subject-observations-loading", thatEl).remove();
                    _.each(observations.models, function (observation) {
                        observation = observation.toJSON();
                        new ObservationRowView({
                            el: $(thatEl).find("tbody"),
                            model: observation
                        }).render();
                    });

                    const oTable = $(thatEl).dataTable({
                        'dom': '<iBfrtlp>',
                        "columns": [
                            {
                                "orderDataType": "dashboard-date"
                            },
                            null,
                            null
                        ],
                        'buttons': [{
                            extend: 'excelHtml5',
                            text: 'Export as Spreadsheet',
                            className: "extra-margin",
                            customizeData: function (data) {
                                const body = data.body;
                                for (let i = 0; i < body.length; i++) {
                                    const raw_content = body[i][1].split(/ +/);
                                    raw_content.pop();
                                    raw_content.pop();
                                    body[i][1] = raw_content.join(' ');
                                }
                            },
                        }],
                    });
                    $(thatEl).parent().width("100%");

                    oTable.fnSort([
                        [2, 'desc']
                    ]);

                }
            });

            return this;
        }
    });

    const PathogenView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#pathogen-tmpl").html()),
        render: function () {
            const thatModel = this.model;
            const entity = thatModel.subject.toJSON();
            $(this.el).html(this.template($.extend(entity, {
                tier: thatModel.tier ? thatModel.tier : null,
                role: thatModel.role ? thatModel.role : null
            })));

            const broadEl = $("ul#synonyms");
            _.each(entity.synonyms, function (aSynonym) {
                if (!aSynonym.displayName) return;
                new SynonymView({
                    model: aSynonym,
                    el: broadEl
                }).render();
            });
            const exactEl = $("ul#exactSynonyms");
            _.each(entity.exactSynonyms, function (aSynonym) {
                if (!aSynonym.displayName) return;
                new SynonymView({
                    model: aSynonym,
                    el: exactEl
                }).render();
            });
            const relatedEl = $("ul#relatedSynonyms");
            _.each(entity.relatedSynonyms, function (aSynonym) {
                if (!aSynonym.displayName) return;
                new SynonymView({
                    model: aSynonym,
                    el: relatedEl
                }).render();
            });

            new SubjectObservationsView({
                model: {
                    subjectId: entity.id,
                    tier: thatModel.tier,
                    role: thatModel.role
                },
                el: "#pathogen-observation-grid"
            }).render();

            return this;
        }
    });

    const CellSubsetView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#cellsubset-tmpl").html()),
        render: function () {
            const thatModel = this.model;
            const entity = thatModel.subject.toJSON();
            $(this.el).html(this.template($.extend(entity, {
                tier: thatModel.tier ? thatModel.tier : null,
                role: thatModel.role ? thatModel.role : null
            })));

            const broadEl = $("ul#synonyms");
            _.each(entity.synonyms, function (aSynonym) {
                if (!aSynonym.displayName) return;
                new SynonymView({
                    model: aSynonym,
                    el: broadEl
                }).render();
            });
            const exactEl = $("ul#exactSynonyms");
            _.each(entity.exactSynonyms, function (aSynonym) {
                if (!aSynonym.displayName) return;
                new SynonymView({
                    model: aSynonym,
                    el: exactEl
                }).render();
            });
            const relatedEl = $("ul#relatedSynonyms");
            _.each(entity.relatedSynonyms, function (aSynonym) {
                if (!aSynonym.displayName) return;
                new SynonymView({
                    model: aSynonym,
                    el: relatedEl
                }).render();
            });

            new SubjectObservationsView({
                model: {
                    subjectId: entity.id,
                    tier: thatModel.tier,
                    role: thatModel.role
                },
                el: "#cellsubset-observation-grid"
            }).render();

            return this;
        }
    });

    const VaccineView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#vaccine-tmpl").html()),
        render: function () {
            const thatModel = this.model;
            const entity = thatModel.subject.toJSON();
            $(this.el).html(this.template($.extend(entity, {
                tier: thatModel.tier ? thatModel.tier : null,
                role: thatModel.role ? thatModel.role : null
            })));

            new SubjectObservationsView({
                model: {
                    subjectId: entity.id,
                    tier: thatModel.tier,
                    role: thatModel.role
                },
                el: "#vaccine-observation-grid"
            }).render();

            return this;
        }
    });

    const GeneView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#gene-tmpl").html()),
        render: function () {
            const thatModel = this.model;
            const result = thatModel.subject.toJSON();
            // Find out the UniProt ID

            result.type = result.class;
            $(this.el).html(this.template($.extend(result, {
                tier: thatModel.tier ? thatModel.tier : null,
                role: thatModel.role ? thatModel.role : null
            })));

            const synonymsEl = $("ul.synonyms");
            _.each(result.synonyms, function (aSynonym) {
                if (aSynonym.displayName == result.displayName) return;

                new SynonymView({
                    model: aSynonym,
                    el: synonymsEl
                }).render();
            });

            const thatEl = $("ul.refs");
            $.getJSON("findProteinFromGene/" + result.id, function (proteins) {
                _.each(proteins, function (protein) {
                    thatEl.append(_.template($("#gene-uniprot-tmpl").html())({
                        uniprotId: protein.uniprotId
                    }));
                });
            });

            new SubjectObservationsView({
                model: {
                    subjectId: result.id,
                    tier: thatModel.tier,
                    role: thatModel.role
                },
                el: "#gene-observation-grid"
            }).render();

            const currentGene = result.displayName;
            $(".addGene-" + currentGene).click(function (e) {
                e.preventDefault();
                updateGeneList(currentGene);
                return this;
            }); //end addGene

            return this;
        }
    });

    const ProteinView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#protein-tmpl").html()),
        render: function () {
            const thatModel = this.model;
            const result = thatModel.subject.toJSON();
            result.type = result.class;
            $(this.el).html(this.template($.extend(result, {
                tier: thatModel.tier ? thatModel.tier : null,
                role: thatModel.role ? thatModel.role : null
            })));

            const synonymsEl = $("ul.synonyms");
            _.each(result.synonyms, function (aSynonym) {
                if (aSynonym.displayName == result.displayName) return;

                new SynonymView({
                    model: aSynonym,
                    el: synonymsEl
                }).render();
            });

            const thatEl = $("ul.transcripts");
            _.each(result.transcripts, function (aTranscript) {
                new TranscriptItemView({
                    model: aTranscript,
                    el: thatEl
                }).render();
            });


            new SubjectObservationsView({
                model: {
                    subjectId: result.id,
                    tier: thatModel.tier,
                    role: thatModel.role
                },
                el: "#protein-observation-grid"
            }).render();

            return this;
        }
    });

    const ShrnaView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#shrna-tmpl").html()),
        render: function () {
            const thatModel = this.model;
            const result = thatModel.subject.toJSON();
            result.type = result.class;
            $(this.el).html(this.template($.extend(result, {
                tier: thatModel.tier ? thatModel.tier : null,
                role: thatModel.role ? thatModel.role : null
            })));

            new SubjectObservationsView({
                model: {
                    subjectId: result.id,
                    tier: thatModel.tier,
                    role: thatModel.role
                },
                el: "#shrna-observation-grid"
            }).render();

            return this;
        }
    });

    const SirnaView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#sirna-tmpl").html()),
        render: function () {
            const thatModel = this.model;
            const result = thatModel.subject.toJSON();
            result.type = "sirna";
            $(this.el).html(this.template($.extend(result, {
                tier: thatModel.tier ? thatModel.tier : null,
                role: thatModel.role ? thatModel.role : null
            })));

            new SubjectObservationsView({
                model: {
                    subjectId: result.id,
                    tier: thatModel.tier,
                    role: thatModel.role
                },
                el: "#sirna-observation-grid"
            }).render();

            return this;
        }
    });

    const TranscriptView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#transcript-tmpl").html()),
        render: function () {
            const thatModel = this.model;
            const result = thatModel.subject.toJSON();
            result.type = result.class;
            $(this.el).html(this.template($.extend(result, {
                tier: thatModel.tier ? thatModel.tier : null,
                role: thatModel.role ? thatModel.role : null
            })));

            new SubjectObservationsView({
                model: {
                    subjectId: result.id,
                    tier: thatModel.tier,
                    role: thatModel.role
                },
                el: "#transcript-observation-grid"
            }).render();

            return this;
        }
    });

    const TissueSampleView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#tissuesample-tmpl").html()),
        render: function () {
            const thatModel = this.model;
            const result = thatModel.subject.toJSON();
            result.type = result.class;
            $(this.el).html(this.template($.extend(result, {
                tier: thatModel.tier ? thatModel.tier : null,
                role: thatModel.role ? thatModel.role : null
            })));

            const thatEl = this.el;
            if (result.xrefs.length == 0) {
                $(thatEl).find("#tissue-refs").hide();
            }
            _.each(result.xrefs, function (xref) {
                //if(xref.databaseName == "NCI_PARENT_THESAURUS" || xref.databaseName == "NCI_THESAURUS") {
                if (xref.databaseName == "NCI_THESAURUS") {
                    const ids = xref.databaseId.split(";");
                    _.each(ids, function (xrefid) {
                        $(thatEl).find("ul.xrefs").append(
                            _.template($("#ncithesaurus-tmpl").html())({
                                nciId: xrefid
                            })
                        );
                    });
                }
            });

            if (result.synonyms.length == 0) {
                $(thatEl).find("#tissue-synonyms").hide();
            }
            const synonymEl = $("ul.synonyms");
            _.each(result.synonyms, function (aSynonym) {
                if (aSynonym.displayName == result.displayName) return;

                new SynonymView({
                    model: aSynonym,
                    el: synonymEl
                }).render();
            });

            new SubjectObservationsView({
                model: {
                    subjectId: result.id,
                    tier: thatModel.tier,
                    role: thatModel.role
                },
                el: "#tissuesample-observation-grid"
            }).render();

            return this;
        }
    });


    const AnimalModelView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#animalmodel-tmpl").html()),
        render: function () {
            const thatModel = this.model;
            const result = thatModel.subject.toJSON();
            result.type = result.class;
            $(this.el).html(this.template($.extend(result, {
                tier: thatModel.tier ? thatModel.tier : null,
                role: thatModel.role ? thatModel.role : null
            })));

            const thatEl = $("ul.synonyms");
            _.each(result.synonyms, function (aSynonym) {
                if (aSynonym.displayName == result.displayName) return;

                new SynonymView({
                    model: aSynonym,
                    el: thatEl
                }).render();
            });

            const thatEl2 = $("#annotations ul");
            _.each(result.annotations, function (annotation) {
                annotation.displayName = annotation.displayName.replace(/_/g, " ");
                new AnnotationView({
                    model: annotation,
                    el: thatEl2
                }).render();
            });

            new SubjectObservationsView({
                model: {
                    subjectId: result.id,
                    tier: thatModel.tier,
                    role: thatModel.role
                },
                el: "#animalmodel-observation-grid"
            }).render();

            return this;
        }
    });


    const AnnotationView = Backbone.View.extend({
        template: _.template($("#annotation-tmpl").html()),
        render: function () {
            $(this.el).append(this.template(this.model));
        }
    });

    const CellSampleView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#cellsample-tmpl").html()),
        render: function () {
            const thatModel = this.model;
            const result = thatModel.subject.toJSON();
            result.type = result.class;

            // Look for cbioPortal Id
            let cbioPortalId = null;
            _.each(result.xrefs, function (xref) {
                if (xref.databaseName == "CBIO_PORTAL") {
                    cbioPortalId = xref.databaseId;
                }
            });

            result.cbioPortalId = cbioPortalId;
            result.type = result.class;

            $(this.el).html(this.template($.extend(result, {
                tier: thatModel.tier ? thatModel.tier : null,
                role: thatModel.role ? thatModel.role : null
            })));

            if (!cbioPortalId) {
                $("#cbiolink").css("display", "none");
            }

            const thatEl = $("ul.synonyms");
            _.each(result.synonyms, function (aSynonym) {
                if (aSynonym.displayName == result.displayName) return;

                new SynonymView({
                    model: aSynonym,
                    el: thatEl
                }).render();
            });

            const thatEl2 = $("#annotations ul");
            _.each(result.annotations, function (annotation) {
                annotation.displayName = annotation.displayName.replace(/_/g, " ");
                new AnnotationView({
                    model: annotation,
                    el: thatEl2
                }).render();
            });

            new SubjectObservationsView({
                model: {
                    subjectId: result.id,
                    tier: thatModel.tier,
                    role: thatModel.role
                },
                el: "#cellsample-observation-grid"
            }).render();

            return this;
        }
    });

    const ObservationRowView = Backbone.View.extend({
        template: _.template($("#observation-row-tmpl").html()),
        render: function () {
            const tableEl = this.el;
            $(tableEl).append(this.template(this.model));
            let summary = this.model.submission.observationTemplate.observationSummary;

            const thatModel = this.model;
            const cellId = "#observation-summary-" + this.model.id;
            const thatEl = $(cellId);
            const observedSubjects = new ObservedSubjects({
                observationId: this.model.id
            });
            observedSubjects.fetch({
                success: function () {
                    _.each(observedSubjects.models, function (observedSubject) {
                        observedSubject = observedSubject.toJSON();

                        if (observedSubject.observedSubjectRole == null || observedSubject.subject == null)
                            return;

                        summary = summary.replace(
                            new RegExp(leftSep + observedSubject.observedSubjectRole.columnName + rightSep, "g"),
                            _.template($("#summary-subject-replacement-tmpl").html())(observedSubject.subject)
                        );
                    });

                    const observedEvidences = new ObservedEvidences({
                        observationId: thatModel.id
                    });
                    observedEvidences.fetch({
                        success: function () {
                            _.each(observedEvidences.models, function (observedEvidence) {
                                observedEvidence = observedEvidence.toJSON();

                                if (observedEvidence.observedEvidenceRole == null || observedEvidence.evidence == null)
                                    return;

                                summary = summary.replace(
                                    new RegExp(leftSep + observedEvidence.observedEvidenceRole.columnName + rightSep, "g"),
                                    _.template($("#summary-evidence-replacement-tmpl").html())(observedEvidence)
                                );
                            });

                            summary += _.template($("#submission-obs-tbl-row-tmpl").html())(thatModel);
                            $(thatEl).html(summary);
                            const dataTable = $(tableEl).parent().DataTable();
                            dataTable.cells(cellId).invalidate();
                            dataTable.order([
                                [0, 'desc'],
                                [1, 'asc']
                            ]).draw();
                        }
                    });
                }
            });

            return this;
        }
    });

    const ObservedSubjectSummaryRowView = Backbone.View.extend({
        template: _.template($("#observedsubject-summary-row-tmpl").html()),
        render: function () {
            const result = this.model;
            if (result.subject == null) return;
            if (result.subject.type == undefined) {
                result.subject.type = result.subject.class;
            }

            if (result.subject.class != "Gene") {
                this.template = _.template($("#observedsubject-summary-row-tmpl").html());
                $(this.el).append(this.template(result));
            } else {
                this.template = _.template($("#observedsubject-gene-summary-row-tmpl").html());
                $(this.el).append(this.template(result));
                const currentGene = result.subject.displayName;

                $(".addGene-" + currentGene).click(function (e) {
                    e.preventDefault();
                    updateGeneList(currentGene);
                    return this;
                }); //end addGene
            }

            return this;
        }
    });

    const CenterView = Backbone.View.extend({
        el: $("#main-container"),
        tableEl: '#center-submission-grid',
        template: _.template($("#center-tmpl").html()),
        render: function (filterProject) {
            const centerModel = this.model.toJSON();
            $(this.el).html(this.template(centerModel));

            const thatEl = this.el;
            const tableElId = this.tableEl;
            const centerSubmissions = new CenterSubmissions({
                centerId: centerModel.id
            });
            centerSubmissions.fetch({
                success: function () {
                    _.each(centerSubmissions.toJSON(), function (submission) {

                        $.ajax("observations/countBySubmission/?submissionId=" + submission.id, {
                            "async": false
                        }).done(function (count) {
                            const tmplName = submission.observationTemplate.isSubmissionStory ?
                                "#count-story-tmpl" :
                                "#count-observations-tmpl";
                            submission.details = _.template(
                                $(tmplName).html())({
                                    count: count
                                });
                        }).fail(function (jqXHR, textStatus, errorThrown) {
                            console.log(jqXHR.status);
                            console.log(jqXHR.responseText);
                            console.log(textStatus);
                            console.log(errorThrown);
                        });

                        new CenterSubmissionRowView({
                            el: $(thatEl).find("tbody"),
                            model: submission
                        }).render();
                    });

                    $(".template-description").tooltip();
                    $(tableElId).dataTable({
                        "columns": [
                            {
                                "visible": false
                            },
                            null,
                            {
                                "orderDataType": "dashboard-date"
                            },
                            null
                        ],
                        "drawCallback": function (settings) {
                            const api = this.api();
                            const rows = api.rows({
                                page: 'current'
                            }).nodes();
                            let last = null;

                            api.column(0, {
                                page: 'current'
                            })
                                .data()
                                .each(function (group, i) {
                                    if (last != group) {
                                        $(rows)
                                            .eq(i)
                                            .before(
                                                _.template($("#tbl-project-title-tmpl").html())({
                                                    project: group,
                                                    centerStableURL: centerModel.stableURL
                                                })
                                            );

                                        last = group;
                                    }
                                });
                        }
                    });

                    if (filterProject != null) {
                        $(tableElId).DataTable().search(filterProject).draw();
                        const mpModel = {
                            filterProject: filterProject,
                            centerStableURL: centerModel.stableURL
                        };
                        new MoreProjectsView({
                            model: mpModel
                        }).render();
                    }
                }
            });

            return this;
        }

    });

    const MoreProjectsView = Backbone.View.extend({
        template: _.template($("#more-projects-tmpl").html()),
        el: "#more-project-container",

        render: function () {
            $(this.el).append(this.template(this.model));
        }
    });

    const SubmissionRowView = Backbone.View.extend({
        template: _.template($("#submission-tbl-row-tmpl").html()),
        render: function () {
            $(this.el).append(this.template(this.model));
            const sTable = $(this.el).parent();

            let summary = this.model.submission.observationTemplate.observationSummary;

            const thatModel = this.model;
            const cellId = "#submission-observation-summary-" + this.model.id;
            const thatEl = $(cellId);
            const observedSubjects = new ObservedSubjects({
                observationId: this.model.id
            });
            observedSubjects.fetch({
                success: function () {
                    _.each(observedSubjects.models, function (observedSubject) {
                        observedSubject = observedSubject.toJSON();

                        if (observedSubject.observedSubjectRole == null || observedSubject.subject == null)
                            return;

                        summary = summary.replace(
                            new RegExp(leftSep + observedSubject.observedSubjectRole.columnName + rightSep, "g"),
                            _.template($("#summary-subject-replacement-tmpl").html())(observedSubject.subject)
                        );
                    });

                    const observedEvidences = new ObservedEvidences({
                        observationId: thatModel.id
                    });
                    observedEvidences.fetch({
                        success: function () {
                            _.each(observedEvidences.models, function (observedEvidence) {
                                observedEvidence = observedEvidence.toJSON();

                                if (observedEvidence.observedEvidenceRole == null || observedEvidence.evidence == null)
                                    return;

                                summary = summary.replace(
                                    new RegExp(leftSep + observedEvidence.observedEvidenceRole.columnName + rightSep, "g"),
                                    _.template($("#summary-evidence-replacement-tmpl").html())(observedEvidence)
                                );
                            });

                            summary += _.template($("#submission-obs-tbl-row-tmpl").html())(thatModel);
                            $(thatEl).html(summary);

                            // let the datatable know about the update
                            $(sTable).DataTable().cells(cellId).invalidate();
                        }
                    });

                }
            });

            return this;
        }
    });

    const SubmissionView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#submission-tmpl").html()),
        render: function () {
            const submission = this.model.toJSON();
            $(this.el).html(this.template(submission));
            $("#download-responseagents").popover({
                placement: 'top',
                trigger: 'hover',
                content: 'Response agents for all signatures in this submission.',
            });

            if (submission.observationTemplate.submissionDescription.length > 0) {
                new SubmissionDescriptionView({
                    model: submission
                }).render();
            }

            const thatEl = this.el;
            const submissionId = this.model.get("id");
            const sTable = '#submission-observation-grid';

            $.ajax("list/similar/" + submissionId).done(function (similarSubmissions) {
                if (similarSubmissions.length < 1) {
                    $("#similar-submission-info").hide();
                } else {
                    let count = 0;
                    _.each(similarSubmissions, function (simSub) {
                        if (count >= 2) simSub.toomany = 'toomany';
                        else simSub.toomany = '';
                        $(thatEl)
                            .find("ul.similar-submission-list")
                            .append(_.template($("#similar-submission-item-tmpl").html())(simSub));
                        count++;
                    });
                    if (count > 2) {
                        const SEE_ALL = "See all";
                        $("#see-all-switch").text(SEE_ALL);
                        $(".toomany").hide();
                        $("#see-all-switch").click(function () {
                            if ($(this).text() == SEE_ALL) {
                                $(".toomany").show();
                                $(this).text("Hide the long list");
                            } else {
                                $(".toomany").hide();
                                $(this).text(SEE_ALL);
                            }
                        });
                    } else $("#see-all-switch").empty();
                }
            });

            $.ajax("observations/countBySubmission/?submissionId=" + submissionId).done(function (count) {
                const observations = new ObservationsBySubmission({
                    submissionId: submissionId
                });
                observations.fetch({
                    success: function () {

                        _.each(observations.models, function (observation) {
                            observation = observation.toJSON();

                            new SubmissionRowView({
                                el: $(thatEl).find(".observations tbody"),
                                model: observation,
                                attributes: {
                                    table: sTable
                                }
                            }).render();
                        });

                        $(sTable).dataTable({
                            dom: "<'fullwidth'ifrtlp>",
                        });

                    }
                });

                if (count > maxNumberOfEntities) {
                    new MoreObservationView({
                        model: {
                            numOfObservations: maxNumberOfEntities,
                            numOfAllObservations: count,
                            submissionId: submissionId,
                            tableEl: sTable,
                            rowView: SubmissionRowView,
                            columns: [null]
                        }
                    }).render();
                }

            });


            return this;
        }
    });

    const MoreObservationView = Backbone.View.extend({
        el: ".more-observations-message",
        template: _.template($("#more-observations-tmpl").html()),
        render: function () {
            const model = this.model;
            const thatEl = this.el;
            $(thatEl).html(this.template(model));

            $("#filter_button").click(function () {
                $("#filtered_number").hide();
                $("#load-filtered").hide();
                $.ajax({
                    url: "observations/countFiltered",
                    data: {
                        subjectId: model.subjectId,
                        filterBy: $("#filter_text").val(),
                    },
                    contentType: "json",

                    success: function (data) {
                        $("#filtered_number").text("The number after filtering is " + data + ".");
                        $("#filtered_number").show();
                        // data is expected to be a number
                        if (data < 1000 && data > 0) {
                            $("#load-filtered").show();
                        }
                    },
                    error: function () {
                        $("#filtered_number").hide();
                        console.log('error from observations/countFiltered');
                    }
                }); //ajax
            });
            $("#load-filtered").click(function (e) {
                e.preventDefault();
                $(thatEl).slideUp();

                const sTableId = model.tableEl;

                const observations = new ObservationsFiltered({
                    subjectId: model.subjectId,
                    filterBy: $("#filter_text").val(),
                });
                observations.fetch({
                    success: function () {
                        console.log("success in ObservationsFiltered fetch");
                        $(sTableId).DataTable().rows().remove().draw().destroy();

                        _.each(observations.models, function (observation, i) {
                            observation = observation.toJSON();

                            new model.rowView({
                                el: $(model.tableEl).find("tbody"),
                                model: observation
                            }).render();
                        });

                        $(sTableId).dataTable({
                            "columns": model.columns
                        });

                    },
                    error: function () {
                        console.log("error in ObservationsFiltered fetch");
                    }
                });
            });
        }
    });

    const TranscriptItemView = Backbone.View.extend({
        template: _.template($("#transcript-item-tmpl").html()),
        render: function () {
            $(this.el).append(this.template(this.model));
            return this;
        }
    });


    const SynonymView = Backbone.View.extend({
        template: _.template($("#synonym-item-tmpl").html()),
        render: function () {
            $(this.el).append(this.template(this.model));
            return this;
        }
    });

    const RoleView = Backbone.View.extend({
        template: _.template($("#role-item-tmpl").html()),
        render: function () {
            $(this.el).append(this.template(this.model));
            return this;
        }
    });

    const EmptyResultsView = Backbone.View.extend({
        template: _.template($("#search-empty-tmpl").html()),
        render: function () {
            $(this.el).append(this.template(this.model));

            return this;
        }
    });

    const SearchResultsRowView = Backbone.View.extend({
        template: _.template($("#search-result-row-tmpl").html()),
        render: function () {
            const model = this.model;
            const result = model.dashboardEntity;
            result.type = result.class;

            if (result.class != "Gene") {
                this.template = _.template($("#search-result-row-tmpl").html());
                $(this.el).append(this.template(model));
            } else {
                this.template = _.template($("#search-result-gene-row-tmpl").html());
                $(this.el).append(this.template(model));
                const currentGene = result.displayName;

                $(".addGene-" + currentGene).click(function (e) {
                    e.preventDefault();
                    updateGeneList(currentGene);
                    return this;
                }); //end addGene
            }

            const thatEl = $("#synonyms-" + result.id);
            _.each(result.synonyms, function (aSynonym) {
                new SynonymView({
                    model: aSynonym,
                    el: thatEl
                }).render();
            });

            const roleEl = $("#roles-" + result.id);
            _.each(model.roles, function (aRole) {
                new RoleView({
                    model: {
                        role: aRole
                    },
                    el: roleEl
                }).render();
            });

            const imageEl = $("#search-image-" + result.id);
            let imgTemplate = $("#search-results-unknown-image-tmpl");
            if (result.class == "Compound") {
                _.each(result.xrefs, function (xref) {
                    if (xref.databaseName == "IMAGE") {
                        result.imageFile = xref.databaseId;
                    }
                });
                imgTemplate = $("#search-results-compund-image-tmpl");
            } else if (result.class == "CellSample") {
                imgTemplate = $("#search-results-cellsample-image-tmpl");
            } else if (result.class == "TissueSample") {
                imgTemplate = $("#search-results-tissuesample-image-tmpl");
            } else if (result.class == "Vaccine") {
                imgTemplate = $("#search-results-vaccine-image-tmpl");
            } else if (result.class == "CellSubset") {
                imgTemplate = $("#search-results-cellsubset-image-tmpl");
            } else if (result.class == "Pathogen") {
                imgTemplate = $("#search-results-pathogen-image-tmpl");
            } else if (result.class == "Gene") {
                imgTemplate = $("#search-results-gene-image-tmpl");
            } else if (result.class == "ShRna" && result.type.toLowerCase() == "sirna") {
                imgTemplate = $("#search-results-sirna-image-tmpl");
            } else if (result.class == "ShRna") {
                imgTemplate = $("#search-results-shrna-image-tmpl");
            } else if (result.class == "Protein") {
                imgTemplate = $("#search-results-protein-image-tmpl");
            }
            imageEl.append(_.template(imgTemplate.html())(result));

            // some of the elements will be hidden in the pagination. Use magic-scoping!
            const updateElId = "#subject-observation-count-" + result.id;
            const updateEl = $(updateElId);
            const cntContent = _.template(
                $("#count-observations-tmpl").html())({
                    count: model.observationCount
                });
            updateEl.html(cntContent);

            return this;
        }
    });

    const tabulate_matching_observations = function (m_observations) {
        $("#observation-search-results").hide();
        if (m_observations.length <= 0) return;

        $("#observation-search-results").fadeIn();
        $("#observation-search-title").popover({
            placement: 'top',
            trigger: 'hover',
            content: 'Matches “subject” terms found in observations.',
        });
        const thatEl = $("#searched-observation-grid");

        $(".subject-observations-loading", thatEl).remove();
        _.each(m_observations, function (observation) {
            new ObservationRowView({
                el: $(thatEl).find("tbody"),
                model: observation
            }).render();
        });
    };

    const SearchView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#search-tmpl").html()),
        render: function () {
            $(this.el).html(this.template(this.model));

            // update the search box accordingly
            $("#omni-input").val(decodeURIComponent(this.model.term));

            const thatEl = this.el;
            const thatModel = this.model;
            const searchResults = new SearchResults({
                term: this.model.term
            });

            searchResults.fetch({
                success: function () {
                    $("#loading-row").remove();
                    if (searchResults.models.length == 0) {
                        (new EmptyResultsView({
                            el: $(thatEl).find("tbody"),
                            model: thatModel
                        })).render();
                    } else {
                        const submissions = [];
                        const matching_observations = [];
                        _.each(searchResults.models, function (aResult) {
                            aResult = aResult.toJSON();
                            if (aResult.dashboardEntity.organism == undefined) {
                                aResult.dashboardEntity.organism = {
                                    displayName: "-"
                                };
                            }

                            if (aResult.dashboardEntity.class == "Submission") {
                                submissions.push(aResult);
                                return;
                            } else if (aResult.dashboardEntity.class == "Observation") {
                                matching_observations.push(aResult.dashboardEntity);
                                return;
                            }

                            new SearchResultsRowView({
                                model: aResult,
                                el: $(thatEl).find("tbody")
                            }).render();
                        });

                        $(".search-info").tooltip({
                            placement: "left"
                        });
                        $(".obs-tooltip").tooltip();

                        const oTable = $("#search-results-grid").dataTable({
                            "columns": [
                                null,
                                null,
                                null,
                                null,
                                null,
                                {
                                    "orderDataType": "dashboard-rank",
                                    "type": 'num',
                                },
                            ]

                        });
                        $(oTable).parent().width("100%");
                        oTable.fnSort([
                            [4, 'desc'],
                            [5, 'desc'],
                            [1, 'asc']
                        ]);

                        // OK done with the subjects; let's build the submissions table
                        $("#submission-search-results").hide();
                        if (submissions.length > 0) {
                            $("#submission-search-results").fadeIn();

                            _.each(submissions, function (submission) {
                                new SearchSubmissionRowView({
                                    model: submission
                                }).render();

                                if (submission.observationTemplate === undefined) { // TODO why does this happen?
                                    submission.observationTemplate = {};
                                }
                                const tmplName = submission.observationTemplate.isSubmissionStory ?
                                    "#count-story-tmpl" :
                                    "#count-observations-tmpl";
                                const cntContent = _.template(
                                    $(tmplName).html())({
                                        count: submission.observationCount
                                    });
                                $("#search-observation-count-" + submission.dashboardEntity.id).html(cntContent);
                            });

                            $("#searched-submissions").dataTable({
                                "columns": [
                                    null,
                                    {
                                        "orderDataType": "dashboard-date"
                                    },
                                    null,
                                    null
                                ]
                            }).fnSort([
                                [3, 'desc'],
                                [2, 'desc']
                            ]);
                        }

                        tabulate_matching_observations(matching_observations);
                    }
                }
            });

            return this;
        }
    });

    const reformattedClassName = {
        "Gene": "gene",
        "AnimalModel": "animal model",
        "Compound": "compound",
        "CellSample": "cell sample",
        "TissueSample": "tissue sample",
        "ShRna": "shRNA",
        "Transcript": "transcript",
        "Protein": "protein",
        "CellSubset": "cell subset",
        "Pathogen": "pathogen",
        "Vaccine": "caccine",
    };

    const ExploreView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#explore-tmpl").html()),

        render: function () {

            const thatModel = this.model;
            thatModel.roles_label = subjectType[thatModel.type];
            $(this.el).html(this.template(thatModel));
            const data_url = $("#explore-tmpl").attr("data-url");
            const subjectWithSummaryCollection = new SubjectWithSummaryCollection(thatModel);
            subjectWithSummaryCollection.fetch({
                success: function () {
                    $("#explore-items").html("");

                    const table_data = [];
                    _.each(subjectWithSummaryCollection.models, function (subjectWithSummary) {
                        const sModel = subjectWithSummary.toJSON();
                        const subject = sModel.subject;
                        if (subject.class == "Compound") {
                            _.each(subject.xrefs, function (xref) {
                                if (xref.databaseName == "IMAGE") {
                                    subject.imageFile = xref.databaseId;
                                }
                            });
                        }
                        const role = sModel.role;
                        let reformatted = reformattedClassName[subject.class];
                        if (subject.class == 'Compound') {
                            reformatted += " <span style='display:inline-block;width:100px'><a href='" + data_url + "compounds/" +
                                subject.imageFile + "' target='_blank' class='compound-image' title='Compound: " +
                                subject.displayName + "'><img class='img-polaroid' style='height:25px' src='" + data_url + "compounds/" +
                                subject.imageFile + "' alt='Compound: " + subject.displayName + "'></a></span>";
                        } else {
                            reformatted += " <img src='img/" + subject.class.toLowerCase() + ".png' style='height:25px' alt=''>";
                        }
                        const nameLink = "<a href='#" + subject.stableURL + "/" + role + "'>" + subject.displayName + "</a>";
                        const n1obv = sModel.numberOfTier1Observations;
                        const n1link = (n1obv == 0 ? "" : "<a href='#" + subject.stableURL + "/" + role + "/1'>" + n1obv + "</a>");
                        table_data.push([reformatted, nameLink, role, n1link]);
                    });
                    $("#explore-table").dataTable({
                        'dom': '<iBfrtlp>',
                        'data': table_data,
                        "deferRender": true,
                        "columns": [
                            null,
                            null,
                            null,
                            {
                                "type": "observation-count"
                            }
                        ],
                        "drawCallback": function (settings) {
                            $("a.compound-image").fancybox({
                                titlePosition: 'inside'
                            });
                        },
                        'buttons': [{
                            extend: 'excelHtml5',
                            text: 'Export as Spreadsheet',
                            className: "extra-margin",
                        }],
                    });
                    $("#explore-table").parent().width("100%");
                    $("#explore-table").width("100%");

                    const blurb = $("#text-blurb");
                    if (blurb.length > 0) {
                        $("#explore-blurb").append(_.template(blurb.html())());
                    }
                    $("#reset-ordering").click(function () {
                        $("#explore-table").DataTable().order.neutral().draw();
                    });
                }
            });

            $("#customize-roles").click(function (e) {
                e.preventDefault();

                const subjectRoles = new SubjectRoles();
                subjectRoles.fetch({
                    success: function () {
                        $("#customized-roles-tbl tbody").html("");

                        const currentRoles = decodeURIComponent(thatModel.roles.toLowerCase());
                        _.each(subjectRoles.models, function (role) {
                            role = role.toJSON();
                            if (browseRole[thatModel.type].indexOf(role.displayName) == -1) return;
                            const checked = currentRoles.search(role.displayName.toLowerCase()) > -1;
                            role.checked = checked;
                            const roleName = role.displayName;
                            role.displayName = roleName.charAt(0).toUpperCase() + roleName.slice(1);
                            new CustomRoleItemView({
                                model: role
                            }).render();
                        });

                        $("#role-modal").modal('show');

                        $("#select-roles-button").click(function (e) {
                            const newRoles = [];
                            $("#role-modal input").each(function () {
                                const aRole = $(this).attr("data-role");
                                if ($(this).prop("checked")) {
                                    newRoles.push(aRole);
                                }

                            });

                            $("#role-modal").modal('hide');
                            window.location.hash = "/explore/" + thatModel.type + "/" + newRoles.join(",");
                        });
                    }
                });
            });

            return this;
        }
    });

    /* this does not have any effect for now because the 'select roles' button is hidden. */
    const browseRole = {
        response_agent: ["gene_biomarker"],
        cellsubset: ['cell_biomarker', 'tissue'],
        pathogen: ["pathogen"],
        vaccine: ["vaccine"]
    };

    const subjectType = {
        response_agent: "Genes",
        cellsubset: 'Cell Subset',
        pathogen: "Pathogens",
        vaccine: "Vaccines"
    };

    //customize-roles-item-tmpl
    const CustomRoleItemView = Backbone.View.extend({
        el: "#customized-roles-tbl tbody",
        template: _.template($("#customize-roles-item-tmpl").html()),

        render: function () {
            if (this.model.checked) {
                $(this.el).prepend(this.template(this.model));
            } else {
                $(this.el).append(this.template(this.model));
            }
            return this;
        }
    });

    //Gene List View
    const GeneListView = Backbone.View.extend({
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
                        const invalidGenes = "";
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

    const CnkbQueryView = Backbone.View.extend({
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

    const CnkbResultView = Backbone.View.extend({
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
                        drawCNKBCytoscape(data, Encoder.htmlEncode(cnkbDescription));

                    } //end success
                }); //end ajax


            }); //end createnetwork

            return this;
        }

    });


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

    const GeneCartHelpView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#gene-cart-help-tmpl").html()),
        render: function () {
            $(this.el).html(this.template({}));
            return this;
        }
    });


    const updateGeneList = function (addedGene) {
        let geneNames = JSON.parse(localStorage.getItem("genelist"));
        if (geneNames == null)
            geneNames = [];

        if (geneNames.length >= numOfCartGene) {
            showAlertMessage("Gene Cart can only contains " + numOfCartGene + " genes.");
            return;
        }

        if (geneNames.indexOf(addedGene) > -1) {
            showAlertMessage(addedGene + " is already in the Gene Cart.");
        } else {
            //Not in the array
            geneNames.push(addedGene);
            localStorage.genelist = JSON.stringify(geneNames);
            showAlertMessage(addedGene + " added to the Gene Cart.");
        }
    };


    const showAlertMessage = function (message) {
        $("#alertMessage").text(message);
        $("#alertMessage").css('color', '#5a5a5a');
        $("#alert-message-modal").modal('show');
    };

    const showInvalidMessage = function (message) {
        $("#alertMessage").text(message);
        $("#alertMessage").css('color', 'red');
        $("#alert-message-modal").modal('show');
    };

    const convertUrl = function (description) {
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
    };

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
                            linkUrl = CORE_API_URL + "#search/" + sym;

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


    /* Routers */
    const AppRouter = Backbone.Router.extend({
        routes: {
            "explore/:type/:roles": "explore",
            "center/:name/:project": "showCenterProject",
            "center/:name": "showCenter",
            "submission/:id": "showSubmission",
            "observation/:id": "showObservation",
            "search/:term": "search",
            "cell-subset/:id": "showCellSubset",
            "cell-subset/:id/:role": "showCellSubset",
            "cell-subset/:id/:role/:tier": "showCellSubset",
            "pathogen/:id": "showPathogen",
            "pathogen/:id/:role": "showPathogen",
            "pathogen/:id/:role/:tier": "showPathogen",
            "vaccine/:id": "showVaccine",
            "vaccine/:id/:role": "showVaccine",
            "vaccine/:id/:role/:tier": "showVaccine",
            "animal-model/:name": "showAnimalModel",
            "animal-model/:name/:role": "showAnimalModel",
            "animal-model/:name/:role/:tier": "showAnimalModel",
            "cell-sample/:name": "showCellSample",
            "cell-sample/:name/:role": "showCellSample",
            "cell-sample/:name/:role/:tier": "showCellSample",
            "compound/:name": "showCompound",
            "compound/:name/:role": "showCompound",
            "compound/:name/:role/:tier": "showCompound",
            "gene/:species/:symbol": "showGene",
            "gene/:species/:symbol/:role": "showGene",
            "gene/:species/:symbol/:role/:tier": "showGene",
            "protein/:name": "showProtein",
            "protein/:name/:role": "showProtein",
            "protein/:name/:role/:tier": "showProtein",
            "rna/:name": "showShRna",
            "rna/:name/:role": "showShRna",
            "rna/:name/:role/:tier": "showShRna",
            "tissue/:name": "showTissueSample",
            "tissue/:name/:role": "showTissueSample",
            "tissue/:name/:role/:tier": "showTissueSample",
            "transcript/:name": "showTranscript",
            "transcript/:name/:role": "showTranscript",
            "transcript/:name/:role/:tier": "showTranscript",
            "genes": "showGeneList",
            "cnkb-query": "showCnkbQuery",
            "cnkb-result": "showCnkbResult",
            "gene-cart-help": "showGeneCartHelp",
            "*actions": "home"
        },

        home: function () {
            new HomeView().render();
        },

        search: function (term) {
            new SearchView({
                model: {
                    term: decodeURI(term)
                        .replace(new RegExp("<", "g"), "")
                        .replace(new RegExp(">", "g"), "")
                }
            }).render();
        },

        explore: function (type, roles) {
            new ExploreView({
                model: {
                    roles: roles.replace(new RegExp("<", "g"), "").replace(new RegExp(">", "g"), ""),
                    type: type.replace(new RegExp("<", "g"), "").replace(new RegExp(">", "g"), ""),
                    customized: false
                }
            }).render();
        },

        showCellSubset: function (id, role, tier) {
            const cellsubset = new CellSubset({
                id: id,
            });
            cellsubset.fetch({
                success: function () {
                    new CellSubsetView({
                        model: {
                            subject: cellsubset,
                            tier: tier,
                            role: role,
                        }
                    }).render();
                }
            });
        },

        showPathogen: function (id, role, tier) {
            const pathogen = new Pathogen({
                id: id,
            });
            pathogen.fetch({
                success: function () {
                    new PathogenView({
                        model: {
                            subject: pathogen,
                            tier: tier,
                            role: role
                        }
                    }).render();
                }
            });
        },

        showVaccine: function (id, role, tier) {
            const vaccine = new Vaccine({
                id: id,
            });
            vaccine.fetch({
                success: function () {
                    new VaccineView({
                        model: {
                            subject: vaccine,
                            tier: tier,
                            role: role
                        }
                    }).render();
                }
            });
        },

        showAnimalModel: function (name, role, tier) {
            const animalModel = new AnimalModel({
                id: name
            });
            animalModel.fetch({
                success: function () {
                    new AnimalModelView({
                        model: {
                            subject: animalModel,
                            tier: tier,
                            role: role
                        }
                    }).render();
                }
            });
        },

        showCellSample: function (name, role, tier) {
            const cellSample = new CellSample({
                id: name
            });

            cellSample.fetch({
                success: function () {
                    new CellSampleView({
                        model: {
                            subject: cellSample,
                            tier: tier,
                            role: role
                        }
                    }).render();
                }
            });
        },

        showCompound: function (name, role, tier) {
            const compound = new Compound({
                id: name
            });
            compound.fetch({
                success: function () {
                    new CompoundView({
                        model: {
                            subject: compound,
                            tier: tier,
                            role: role
                        }
                    }).render();
                }
            });
        },

        showProtein: function (name, role, tier) {
            const protein = new Protein({
                id: name
            });
            protein.fetch({
                success: function () {
                    new ProteinView({
                        model: {
                            subject: protein,
                            tier: tier,
                            role: role
                        }
                    }).render();
                }
            });
        },

        showShRna: function (name, role, tier) {
            const shRna = new ShRna({
                id: name
            });
            shRna.fetch({
                success: function () {
                    // shRna covers both siRNA and shRNA
                    let rnaView;
                    if (shRna.get("type").toLowerCase() == "sirna") {
                        rnaView = new SirnaView({
                            model: {
                                subject: shRna,
                                tier: tier,
                                role: role
                            }
                        });
                    } else {
                        rnaView = new ShrnaView({
                            model: {
                                subject: shRna,
                                tier: tier,
                                role: role
                            }
                        });
                    }
                    rnaView.render();
                }
            });
        },

        showTissueSample: function (name, role, tier) {
            const tissueSample = new TissueSample({
                id: name
            });
            tissueSample.fetch({
                success: function () {
                    new TissueSampleView({
                        model: {
                            subject: tissueSample,
                            tier: tier,
                            role: role
                        }
                    }).render();
                }
            });
        },

        showTranscript: function (name, role, tier) {
            const transcript = new Transcript({
                id: name
            });
            transcript.fetch({
                success: function () {
                    new TranscriptView({
                        model: {
                            subject: transcript,
                            tier: tier,
                            role: role
                        }
                    }).render();
                }
            });
        },

        showGene: function (species, symbol, role, tier) {
            const gmodel = new Gene({
                species: species,
                symbol: symbol
            });
            gmodel.fetch({
                success: function () {
                    new GeneView({
                        model: {
                            subject: gmodel,
                            tier: tier,
                            role: role
                        }
                    }).render();
                }
            });
        },

        showCenter: function (name) {
            const center = new SubmissionCenter({
                id: name
            });
            center.fetch({
                success: function () {
                    new CenterView({
                        model: center
                    }).render(null);
                }
            });
        },

        showCenterProject: function (name, project) {
            const center = new SubmissionCenter({
                id: name
            });
            center.fetch({
                success: function () {
                    project = decodeURI(project)
                        .replace(new RegExp("<", "g"), "")
                        .replace(new RegExp(">", "g"), "");
                    new CenterView({
                        model: center
                    }).render(project);
                }
            });
        },

        showSubmission: function (id) {
            const submission = new Submission({
                id: id
            });
            submission.fetch({
                success: function () {
                    new SubmissionView({
                        model: submission
                    }).render();
                }
            });
        },

        showObservation: function (id) {
            const observation = new Observation({
                id: id
            });
            observation.fetch({
                success: function () {
                    new ObservationView({
                        model: observation
                    }).render();
                }
            });
        },

        showGeneList: function () {
            new GeneListView().render();
        },

        showCnkbQuery: function () {
            new CnkbQueryView().render();
        },

        showCnkbResult: function () {
            new CnkbResultView().render();
        },

        showGeneCartHelp: function () {
            new GeneCartHelpView().render();
        },
    });

    $(function () {
        new AppRouter();
        Backbone.history.start();

        $("#omnisearch").submit(function () {
            const searchTerm = $("#omni-input").val();
            window.location.hash = "search/" + encodeURI(encodeURIComponent(searchTerm));
            return false;
        });

        $("#omni-input").popover({
            placement: "bottom",
            trigger: "manual",
            html: true,
            title: function () {
                $(this).attr("title");
            },
            content: function () {
                return $("#search-help-content").html();
            },
        }).on("mouseenter", function () {
            const _this = this;
            $(this).popover("show");
            $(".popover").on("mouseleave", function () {
                $(_this).popover('hide');
            });
        }).on("mouseleave", function () {
            const _this = this;
            setTimeout(function () {
                if (!$(".popover:hover").length) {
                    $(_this).popover("hide");
                }
            }, 300);
        });

        $("a.help-navigate").click(function (e) {
            e.preventDefault();
            (new HelpNavigateView()).render();
        });
    });

})(window.jQuery);