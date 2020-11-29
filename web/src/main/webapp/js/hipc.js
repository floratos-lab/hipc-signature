import { numOfCartGene, showAlertMessage, CnkbResultView } from './cnkb.js'
import { class2imageData } from './hipc-subject-images.js'

(function ($) {
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
        },
        "text-date-order": function (settings, col) {
            return this.api().column(col, {
                order: 'index'
            }).nodes().map(
                function (td, i) {
                    return new Date($(td).html().replace(",", " 1,")).getTime();
                }
            );
        },
        'submission-count': function (settings, col) {
            return this.api().column(col, {
                order: 'index'
            }).nodes().map(
                function (td, i) {
                    const t = $('a', td).text().trim();
                    return parseInt(t.split(' ')[0]);
                }
            );
        },
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

    const Submission = Backbone.Model.extend({
        urlRoot: CORE_API_URL + "get/submission"
    });

    const SubmissionsPerPMID = Backbone.Collection.extend({
        url: CORE_API_URL + "list/submission/",
        model: Submission,

        initialize: function (attributes) {
            this.url += attributes.pmid;
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
                /* only for CellSubset */
                this.url += "&role=" + attributes.role;
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

    const PMID = Backbone.Model.extend({
    });

    const PMIDs = Backbone.Collection.extend({
        url: CORE_API_URL + "list/pmids",
        model: PMID,
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

    const PMIDListRowView = Backbone.View.extend({
        template: _.template($("#pmid-tbl-row-tmpl").html()),
        render: function () {
            $(this.el).append(this.template(this.model));
            $('.clickable-popover').popover({
                placement: "bottom",
                trigger: 'hover',
            }).click(function () {
                $(this).popover('hide');
            });
            return this;
        }

    });

    const PMIDListView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#pmids-tmpl").html()),
        render: function () {
            $(this.el).html(this.template({}));

            const centers = new PMIDs();
            const thatEl = this.el;
            centers.fetch({
                success: function () {
                    _.each(centers.models, function (pmids) {
                        const aCenter = pmids.toJSON()
                        new PMIDListRowView({
                            el: $(thatEl).find("#centers-tbody"),
                            model: aCenter
                        }).render();
                    });

                    $("#centers-list-table").dataTable({
                        "iDisplayLength": 25,
                        columnDefs: [{
                            targets: 2,
                            orderDataType: "text-date-order",
                        }, {
                            targets: 3,
                            orderDataType: "submission-count",
                            type: "numeric"
                        },
                        ],
                    }).fnSort([
                        [2, 'desc']
                    ]);
                }
            });
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
                        const imageData = class2imageData[subject.class];
                        imageData.stableURL = subject.stableURL;
                        const thatEl2 = $("#subject-image-" + observedSubject.id);
                        const imgTemplate = $("#search-results-image-tmpl");
                        if (subject.class == "Compound") {
                            const compound = new Subject({
                                id: subject.id
                            });
                            compound.fetch({
                                success: function () {
                                    _.each(compound.toJSON().xrefs, function (xref) {
                                        if (xref.databaseName == "IMAGE") {
                                            imageData.image = $("#explore-tmpl").attr("data-url") + "compounds/" + xref.databaseId;
                                        }
                                    });
                                    thatEl2.append(_.template(imgTemplate.html())(imageData));
                                }
                            });
                        } else {
                            if (subject.type.toLowerCase() == "sirna") {
                                imageData.image = 'img/sirna.png';
                                imageData.label = "siRNA";
                            }
                            thatEl2.append(_.template(imgTemplate.html())(imageData));
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

                    const oTable = $('#observed-evidences-grid').dataTable({
                        "iDisplayLength": 50,
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

            window.scroll(0, 0);
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
                templateId = "#observedfileevidence-row-tmpl";
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

    const SubmissionsPerPMIDRowView = Backbone.View.extend({
        template: _.template($("#submissions-per-pmid-tbl-row-tmpl").html()),
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

            $(this.el).html(this.template(result));

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
                },
                el: "#related-observations"
            }).render();

            $("a.compound-image").fancybox({
                titlePosition: 'inside'
            });
            return this;
        }
    });

    const SubjectObservationsView = Backbone.View.extend({
        render: function () {
            $(this.el).append(_.template($("#related-observations-tmpl").html())(this.model));
            const thatEl = $(this.el).find('#related-observation-grid');
            const thatModel = this.model;
            const subjectId = thatModel.subjectId;
            const role = thatModel.role; // possibly undefined

            let countUrl = "observations/countBySubject/?subjectId=" + subjectId;
            if (role != undefined) {
                /* only needed by CellSubset */
                countUrl += "&role=" + role;
            }

            $.ajax(countUrl).done(function (count) {
                $.ajax('/observations/limit').done(function (limit) {
                    if (count > limit) {
                        new MoreObservationView({
                            model: {
                                role: role,
                                numOfObservations: limit,
                                numOfAllObservations: count,
                                subjectId: subjectId,
                                tableEl: thatEl,
                                rowView: ObservationRowView,
                                columns: [{
                                    "orderDataType": "dashboard-date"
                                },
                                    null,
                                    null
                                ]
                            }
                        }).render();
                    }
                });
            });

            const observations = new ObservationsBySubject({
                subjectId: subjectId,
                role: role, // undefined unless Cell Subset
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
                        "columns": [{
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
            $(this.el).html(this.template(entity));

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
                },
                el: "#related-observations"
            }).render();

            window.scroll(0, 0);
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
                    role: thatModel.role
                },
                el: "#related-observations"
            }).render();
            if (thatModel.role != null) {
                $('#related-observations h3').append(' <small>for the role of ' + thatModel.role + '</small>');
            }

            window.scroll(0, 0);
            return this;
        }
    });

    const VaccineView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#vaccine-tmpl").html()),
        render: function () {
            const thatModel = this.model;
            const entity = thatModel.subject.toJSON();
            $(this.el).html(this.template(entity));

            new SubjectObservationsView({
                model: {
                    subjectId: entity.id,
                },
                el: "#related-observations"
            }).render();

            window.scroll(0, 0);
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

            result.genecard = false;
            _.each(result.xrefs, function (xref) {
                if (xref.databaseName == "GeneCards") {
                    result.genecard = xref.databaseId;
                }
            });

            result.type = result.class;
            $(this.el).html(this.template(result));

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
                },
                el: "#related-observations"
            }).render();

            const currentGene = result.displayName;
            $(".addGene-" + currentGene).click(function (e) {
                e.preventDefault();
                updateGeneList(currentGene);
                return this;
            }); //end addGene

            window.scroll(0, 0);
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
            $(this.el).html(this.template(result));

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
                },
                el: "#related-observations"
            }).render();

            return this;
        }
    });

    const RnaView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#rna-tmpl").html()),
        render: function () {
            const thatModel = this.model;
            const result = thatModel.subject.toJSON();
            $(this.el).html(this.template(result));

            new SubjectObservationsView({
                model: {
                    subjectId: result.id,
                },
                el: "#related-observations"
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
            $(this.el).html(this.template(result));

            new SubjectObservationsView({
                model: {
                    subjectId: result.id,
                },
                el: "#related-observations"
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
            $(this.el).html(this.template(result));

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
                },
                el: "#related-observations"
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
            $(this.el).html(this.template(result));

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
                },
                el: "#related-observations"
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

            $(this.el).html(this.template(result));

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
                },
                el: "#related-observations"
            }).render();

            return this;
        }
    });

    const ObservationRowView = Backbone.View.extend({
        template: _.template($("#observation-row-tmpl").html()),
        render: function () {
            const tableEl = this.el;
            this.model.pmid = this.model.submission.observationTemplate.PMID;
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

    const PerPMIDView = Backbone.View.extend({
        el: $("#main-container"),
        tableEl: '#submissions-per-pmid-grid',
        template: _.template($("#per-pmid-tmpl").html()),
        render: function () {
            const model = this.model;
            $(this.el).html(this.template(model));

            const thatEl = this.el;
            const tableElId = this.tableEl;
            const submissionsPerPMID = new SubmissionsPerPMID({
                pmid: model.pmid,
            });
            submissionsPerPMID.fetch({
                success: function () {
                    _.each(submissionsPerPMID.toJSON(), function (submission) {

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

                        new SubmissionsPerPMIDRowView({
                            el: $(thatEl).find("tbody"),
                            model: submission
                        }).render();
                    });

                    $(tableElId).dataTable({
                        "columns": [
                            null,
                            null,
                            {
                                "orderDataType": "text-date-order"
                            },
                            {
                                orderDataType: "submission-count",
                                type: "numeric",
                            }
                        ],
                    }).fnSort([
                        [2, 'desc']
                    ]);
                }
            });

            return this;
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
                            dom: "<'fullwidth'iBfrtlp>",
                            'buttons': [{
                                extend: 'excelHtml5',
                                text: 'Export as Spreadsheet',
                                className: "extra-margin",
                            }],
                        });

                    }
                });

                $.ajax('/observations/limit').done(function (limit) {
                    if (count > limit) {
                        new MoreObservationView({
                            model: {
                                numOfObservations: limit,
                                numOfAllObservations: count,
                                submissionId: submissionId,
                                tableEl: sTable,
                                rowView: SubmissionRowView,
                                columns: [null]
                            }
                        }).render();
                    }
                });
            });

            window.scroll(0, 0);
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

            const imageEl = $("#search-image-" + result.id);
            const imageData = class2imageData[result.class];
            imageData.stableURL = result.stableURL;
            const imgTemplate = $("#search-results-image-tmpl");
            if (result.class == "Compound") {
                _.each(result.xrefs, function (xref) {
                    if (xref.databaseName == "IMAGE") {
                        imageData.image = $("#explore-tmpl").attr("data-url") + "compounds/" + xref.databaseId;
                    }
                });
            } else if (result.class == "ShRna" && result.type.toLowerCase() == "sirna") {
                imageData.image = "img/sirna.png";
                imageData.label = "siRNA";
            }
            imageEl.append(_.template(imgTemplate.html())(imageData));

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
        $(thatEl).width("100%");
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
                    $("#submission-search-results").hide();
                    $("#observation-search-results").hide();
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

                            if (aResult.dashboardEntity.class == "CellSubset") {
                                aResult.dashboardEntity.id = aResult.dashboardEntity.id + aResult.role;
                            } else {
                                aResult.role = aResult.dashboardEntity.class.toLowerCase();
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
        "Vaccine": "vaccine",
    };

    const ExploreView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#explore-tmpl").html()),

        render: function () {

            const thatModel = this.model;
            thatModel.roles_label = subjectType[thatModel.roles];
            $(this.el).html(this.template(thatModel));
            const data_url = $("#explore-tmpl").attr("data-url");
            const subjectWithSummaryCollection = new SubjectWithSummaryCollection(thatModel);
            $("#explore-table").hide();
            subjectWithSummaryCollection.fetch({
                success: function () {
                    $("#explore-items").html("");
                    $("#loading-spinner").hide();
                    $("#explore-table").show();

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
                        const n1link = (n1obv == 0 ? "" : "<a href='#" + subject.stableURL + "/" + role + "'>" + n1obv + "</a>");
                        table_data.push([reformatted, nameLink, n1link]);
                    });
                    $("#explore-table").dataTable({
                        'dom': '<iBfrtlp>',
                        'data': table_data,
                        "deferRender": true,
                        "columns": [
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

    const GeneExploreView = Backbone.View.extend({
        el: $("#main-container"),
        template: _.template($("#gene-explore-tmpl").html()),

        render: function () {

            $(this.el).html(this.template({
                roles_label: 'Genes'
            }));

            $("#gene-explore-table").dataTable({
                'dom': '<iBfrtlp>',
                serverSide: true,
                ajax: 'gene-data',
                "deferRender": true,
                "order": [
                    [2, "desc"]
                ],
                "columns": [{
                    data: function () {
                        return 'gene <img src="img/gene.png" style="height:25px" alt="">';
                    }
                },
                {
                    // https://datatables.net/reference/option/columns.data
                    data: function (row, type, set, meta) {
                        return '<a href="#' + row[2] + '">' + row[0] + '</a>';
                    }
                },
                {
                    data: function (row, type, set, meta) {
                        return '<a href="#' + row[2] + '">' + row[1] + '</a>';
                    },
                    "type": "observation-count"
                }
                ],
                'buttons': [{
                    extend: 'excelHtml5',
                    text: 'Export as Spreadsheet',
                    className: "extra-margin",
                    customizeData: function (data) {
                        let orderBy = 2,
                            direction = 'desc';
                        const th = $("#gene-explore-table>thead>tr>th");
                        if ($(th[1]).hasClass("sorting_asc")) {
                            orderBy = 1;
                            direction = 'asc';
                        } else if ($(th[1]).hasClass("sorting_desc")) {
                            orderBy = 1;
                            direction = 'desc';
                        } else if ($(th[2]).hasClass("sorting_asc")) {
                            orderBy = 2;
                            direction = 'asc';
                        }
                        const filterBy = $("#gene-explore-table_filter input[type=search]").val().trim();
                        $.ajax({
                            "url": "gene-data/all",
                            data: {
                                orderBy: orderBy,
                                direction: direction,
                                filterBy: filterBy,
                            },
                            "async": false,
                            "success": function (res, status, xhr) {
                                data.body = [];
                                for (let i = 0; i < res.length; i++) {
                                    data.body[i] = ['gene', res[i][0], res[i][1]];
                                }
                            },
                            error: function (event, jqxhr, settings, thrownError) {
                                console.log('error ' + thrownError + ' at ' + settings.url);
                            },
                        });
                    },
                }],
            });
            $("#gene-explore-table").parent().width("100%");
            $("#gene-explore-table").width("100%");

            const blurb = $("#text-blurb");
            if (blurb.length > 0) {
                $("#gene-explore-blurb").append(_.template(blurb.html())());
            }

            return this;
        }
    });

    /* this does not have any effect for now because the 'select roles' button is hidden. */
    const browseRole = {
        cellsubset: ['cell_biomarker', 'tissue'],
        pathogen: ["pathogen"],
        vaccine: ["vaccine"]
    };

    const subjectType = {
        cell_biomarker: "Cell Types",
        tissue: "Tissues",
        Pathogen: "Pathogens",
        Vaccine: "Vaccines"
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

    const subjectRouter = function (SubjectModel, SubjectView) {
        return function (name, role) {
            const model = new SubjectModel({
                id: name
            });
            model.fetch({
                success: function () {
                    new SubjectView({
                        model: {
                            subject: model,
                            role: role
                        }
                    }).render();
                }
            });
        };
    };

    const viewOnlyRouter = function (View) {
        return function () {
            new View().render();
        };
    };

    /* Routers */
    const AppRouter = Backbone.Router.extend({
        routes: {
            "explore/genes": "genes",
            "explore/:type/:roles": "explore",
            "pmids": viewOnlyRouter(PMIDListView),
            "pmid/:pmid": "showStudiesPerPMID",
            "submission/:id": "showSubmission",
            "observation/:id": "showObservation",
            "search/:term": "search",
            "cell-subset/:name(/:role)": subjectRouter(CellSubset, CellSubsetView),
            "pathogen/:name(/:role)": subjectRouter(Pathogen, PathogenView),
            "vaccine/:name(/:role)": subjectRouter(Vaccine, VaccineView),
            "animal-model/:name(/:role)": subjectRouter(AnimalModel, AnimalModelView),
            "cell-sample/:name(/:role)": subjectRouter(CellSample, CellSampleView),
            "compound/:name(/:role)": subjectRouter(Compound, CompoundView),
            "protein/:name(/:role)": subjectRouter(Protein, ProteinView),
            "tissue/:name(/:role)": subjectRouter(TissueSample, TissueSampleView),
            "transcript/:name(/:role)": subjectRouter(Transcript, TranscriptView),
            "rna/:name(/:role)": subjectRouter(ShRna, RnaView),
            "gene/:species/:symbol": "showGene",
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

        genes: function () {
            new GeneExploreView().render();
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

        showGene: function (species, symbol) {
            const gmodel = new Gene({
                species: species,
                symbol: symbol
            });
            gmodel.fetch({
                success: function () {
                    new GeneView({
                        model: {
                            subject: gmodel,
                        }
                    }).render();
                }
            });
        },

        showStudiesPerPMID: function (pmid) {
            new PerPMIDView({
                model: { pmid: pmid },
            }).render();
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
        $.ajax({
            url: '/release-version',
            success: function (data) {
                $("#release-version").text(data);
            }
        })
    });

})(window.jQuery);