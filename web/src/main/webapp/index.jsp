<!DOCTYPE html>
<%@page import="org.springframework.web.context.WebApplicationContext"%>
<%@page import="org.springframework.web.context.support.WebApplicationContextUtils"%>
<%
    WebApplicationContext context = WebApplicationContextUtils
            .getWebApplicationContext(application);
    String dataURL = (String) context.getBean("dataURL");
    Integer maxNumOfObservations = (Integer) context.getBean("maxNumberOfEntities");
    String dashboardReleaseVersion = (String) context.getBean("dashboardReleaseVersion");
%>
<html lang="en" xmlns="http://www.w3.org/1999/html">

<head>
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-169441884-1"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-169441884-1');
</script>

    <!-- X-UA-Compatible meta tag to disable IE compatibility view must always be first -->
    <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>HIPC DASHBOARD</title>
    <meta name="description" content="" />
    <meta name="author" content="" />

    <link rel="shortcut icon" href="img/favicon.ico" type="image/vnd.microsoft.icon" />
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    <link rel="stylesheet" href="css/datatables.min.css" type="text/css" />
    <link rel="stylesheet" href="css/buttons.dataTables.min.css" type="text/css" />
    <link rel="stylesheet" href="css/jquery.fancybox.min.css" type="text/css" media="screen" />
    <link rel="stylesheet" href="css/jquery.contextMenu.min.css" type="text/css" />
    <link rel="stylesheet" href="css/hipc.css?ts=2019" type="text/css" />
</head>

<body>
    <div id="header">
        <div class="container">

            <h1>
                <a href="#"><span>Human Immunology Project Consortium</span></a>
            </h1>

            <ul id="main-nav">
                <li><a id="navlink-dashboard" class="navlink" href="#">HIPC DASHBOARD</a></li>
                <li><a id="navlink-centers" class="navlink" href="#center/hipc">Studies</a></li>
                <li>
                    <a class="dropdown-toggle navlink" href="#" data-toggle="dropdown">Resources <b
                            class="caret"></b></a>
                    <ul class="dropdown">
                        <li><a target="_blank" href="https://www.immuneprofiling.org/hipc/page/show">HIPC Home Page</a>
                        </li>
                        <li><a target="_blank"
                                href="https://www.immuneprofiling.org/hipc/page/show?pg=publications">Publications</a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a id="navlink-browse" class="dropdown-toggle navlink" href="#" data-toggle="dropdown">Browse <b
                            class="caret"></b></a>
                    <ul id="dropdown-menu-browse" class="dropdown">
                        <li><a href="#explore/genes">Genes</a></li>
                        <li><a href="#explore/cellsubset/cell_biomarker">Cell Types</a></li>
                        <li><a href="#explore/pathogen/Pathogen">Pathogens</a></li>
                        <li><a href="#explore/vaccine/Vaccine">Vaccines</a></li>
                        <li><a href="#explore/cellsubset/tissue">Tissues</a></li>
                    </ul>
                </li>
                <li>
                    <a id="navlink-genecart" class="dropdown-toggle navlink" href="#" data-toggle="dropdown">Gene Cart
                        <b class="caret"></b></a>
                    <ul id="dropdown-menu-genecart" class="dropdown">
                        <li><a href="#genes">Go To Cart</a></li>
                        <li><a href="#gene-cart-help">Help</a></li>
                    </ul>
                </li>
                <li>
                    <form id="omnisearch">
                        <input type="text" id="omni-input" title="Search" placeholder="e.g. CTNNB1 or T cell">
                        <button type="submit">Search</button>
                        <span class="d-none" id="search-help-content">
                            <p>Please enter the keyword you would like to search on the website.</p>
                            <strong>Examples:</strong>
                            <ul>
                                <li><em>Gene: </em> <a href="#search/CTNNB1">CTNNB1</a></li>
                                <li><em>Cell Subset: </em> <a href="#search/%2522alpha-beta T cell%2522">"alpha-beta T cell"</a></li>
                                <li><em>Cell Subset: </em> <a href="#search/blood plasma">blood plasma</a></li>
                                <li><em>Pathogen: </em> <a href="#search/Yellow fever">Yellow fever</a></li>
                                <li><em>Pathogen: </em> <a href="#search/%2522(B%252FBrisbane%252F60%252F2008)%2522">"(B/Brisbane/60/2008)"</a></li>
                                <li><em>Vaccine: </em> <a href="#search/Menactra">Menactra</a></li>
                                <li><em>Multiple: </em> <a href="#search/STAT3 Zostavax">STAT3 Zostavax</a></li>
                            </ul>
                            <br>
                        </span>
                    </form>
                </li>
            </ul>

        </div>
        <!--end header container-->
    </div>
    <!--end header-->

    <!-- NAVBAR
    ================================================== -->
    <script src="https://code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
    <script>
        $(function () {
            // Bind an event to window.onhashchange that, when the hash changes, 
            // gets the hash and alters class of desired navlinks
            window.onhashchange = function () {
                var hash = location.hash || '#';
                $('[id^="navlink-"]').each(function () {
                    // navbar regular items
                    if (
                        $(this).attr('id') == 'navlink-dashboard' ||
                        $(this).attr('id') == 'navlink-centers'
                    ) {
                        if ($(this).attr('href') === decodeURIComponent(hash)) {
                            $(this).removeClass('navlink');
                            $(this).addClass('navlink-current');
                        } else {
                            $(this).removeClass('navlink-current');
                            $(this).addClass('navlink');
                        }
                    }
                    // navbar dropdown menu items
                    else if (
                        $(this).attr('id') == 'navlink-browse' ||
                        $(this).attr('id') == 'navlink-genecart'
                    ) {
                        var id = $(this).attr('id') == 'navlink-browse' ?
                            'dropdown-menu-browse' :
                            'dropdown-menu-genecart';
                        var dropdownLink = $(this);
                        $('#' + id + ' li a').each(function () {
                            if ($(this).attr('href') === decodeURIComponent(hash)) {
                                dropdownLink.removeClass('navlink');
                                dropdownLink.addClass('navlink-current');
                                return false;
                            } else {
                                dropdownLink.removeClass('navlink-current');
                                dropdownLink.addClass('navlink');
                            }
                        });
                    }
                });
            };
            // Since the event is only triggered when the hash changes, we need to trigger
            // the event now, to handle the hash the page may have been loaded with.
            window.onhashchange();
        });
    </script>

    <!-- all the backbone magic will happen here, right in this div -->
    <div id="main-container"></div>

    <div class="container">
        <!-- FOOTER -->
        <footer>
            <p><small>HIPC DASHBOARD Release
                    <%=dashboardReleaseVersion%></small></p>
            <p>
                <small>
                    <p>
                        As the HIPC Network continues to refine the Signature, input from the research community is
                        highly valued to help improve usability.<br>
                        <b>Note</b>: Data users must acknowledge HIPC Network and visit <a
                            href="https://www.immuneprofiling.org">HIPC
                            publication guidelines</a> for more information.<br>
                        To provide feedback, please send comments to <a
                            href="mailto:hipcfeedback?subject=HIPC DASHBOARD Feedback">hipcfeedback@columbia.edu</a>.
                    </p>
                </small>
            </p>

            <p>
                <a class="help-navigate" href="#help-navigate">Glossary</a> &middot;
                <a href="https://www.immuneprofiling.org" target="_blank">Policies</a> &middot;
                <a href="https://www.immuneprofiling.org" target="_blank">Accessibility</a> &middot;
                <a href="https://www.immuneprofiling.org" target="_blank">FOIA</a>
            </p>

        </footer>
    </div>

    <div class="modal hide fade" id="alert-message-modal">
        <!-- a hidden div for showing alert message -->
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-body">
                    <br>
                    <medium id="alertMessage"></medium>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal hide fade" id="popup-textarea-modal">
        <div class="modal-body">
            <textarea id="temporary-text" style='width:95%' rows='10' cols='100'></textarea>
        </div>
        <div class="modal-footer">
            <button class="btn btn-primary" data-dismiss="modal" id="close-tempoary-text">Close</button>
        </div>
        <span id='invoker-id' style='display:none'></span>
    </div>

    <div class="modal fade" tabindex="-1" role="dialog" id="confirmation-modal">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span
                            aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">Delete Confirmation</h4>
                </div>
                <div class="modal-body">
                    <p id="confirmation-message">Are you sure you want to delete this?</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" data-dismiss="modal" id="confirmed-delete">Yes,
                        delete it.</button>
                </div>
            </div>
        </div>
    </div>

    <!-- these are the templates -->
    <script type="text/template" id="home-tmpl">
        <div class="overview-container" style="background-color:#f1f5de;background-image:url('./images/bg_feature.png');background-repeat:repeat-x;padding-top: 12px;">
            <div class="container overview-box">
                <div class="row">
                    <div class="col-9">
                        <div class="featurette" id="overview-text">
                            <a href="https://www.immuneprofiling.org/hipc/page/show">
                            <img class="img-polaroid pull-left" src="img/logos/hipc_overall.png" alt="HIPC general image" title="HIPC general image" style="width:auto;height:auto">
                            </a>
                            <p class="lead firstlead">
                                Funded by the National Institute of Allergy and Infectious Diseases (NIAID) of the US National Institutes of Health (NIH), 
                                <a href="https://www.immuneprofiling.org/">the Human Immunology Project Consortium (HIPC)</a> is a network of research centers working collaboratively  
                                to characterize the status of the human immune system in diverse populations under both normal conditions and in response to stimuli. 
                                Using computational analysis of large-scale experimental data from high-throughput systems biology approaches 
                                coupled with detailed clinical phenotyping in well-characterized human cohorts, the HIPC aims to identify molecular “signatures” 
                                that correlate with the outcomes of vaccinations, adjuvants or natural infections in humans. 
                                To facilitate dissemination of this information to the scientific community the Consortium has developed the “HIPC Dashboard,” 
                                a web interface that provides access to consistently annotated immune signatures generated by HIPC activities as well as curated from the literature.  
                                To learn how information in the Dashboard is organized, please visit <a id="homepage-help-navigate" href="#help-navigate">Navigating and Understanding Dashboard Content</a>.
                            </p>
                        </div>
                    </div>
                    <div class="col-3">
                        <img src="img/Autoimmune Diseases_0.jpg" class="title-image">
                    <div>

                </div>
            </div>
        </div>

        <div class="dark-separator"></div>

        <div class="container ctd2-boxes">
          <div class="row browse-menu">
            <div class="col-4 target" data-order="1" style="display:table-cell;float:none;position:relative;padding-bottom:25px">
              <h4>Genes</h4>
                <p>
                    Explore genes identified as components of vaccine response signatures
                </p>
                <a class="btn btn-success btn-block browse-button" href="#explore/genes">Browse &raquo;</a>
            </div>
            <div class="col-4 drug" data-order="2" style="display:table-cell;float:none;position:relative;padding-bottom:25px">
              <h4>Pathogens</h4>
                <p>
                    Explore pathogens targeted in vaccination response studies
                </p>
                <a class="btn btn-info btn-block browse-button" href="#explore/pathogen/Pathogen">Browse &raquo;</a>
            </div>
              <div class="col-4 context" data-order="3" style="display:table-cell;float:none;position:relative;padding-bottom:25px">
                  <h4>Cell Types</h4>
                  <p>
                    Explore cell types identified as components of vaccine response signatures
                  </p>
                  <a class="btn btn-warning btn-block browse-button" href="#explore/cellsubset/cell_biomarker">Browse &raquo;</a>
              </div>

          </div><!-- /.row -->
          <p>For more types, please use the browse menu above.</p>
        </div><!-- /.container -->

    </script>

    <script type="text/template" id="center-tmpl">
        <div class="container common-container" id="center-submission-container">
            <div class="row">
                <div class="col-9">
                    <h2 class="center-title">Studies</h2>
                </div>
                <div class="col-3">
                    <img src="img/{{displayName}}.png" title="{{displayName}}" alt="{{displayName}}" class="img-polaroid" width="200">
                </div>
            </div>

            <div id="more-project-container"></div>

            <table id="center-submission-grid" class="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th>Project</th>
                        <th>Description</th>
                        <th width="90">Publication Date</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- here will go the rows -->
                </tbody>
            </table>
        </div>
    </script>

    <script type="text/template" id="center-submission-tbl-row-tmpl">
        <tr>
            <td>{{observationTemplate.project}}</td>
            <td>
                {{(observationTemplate.submissionDescription != "") ? observationTemplate.submissionDescription : observationTemplate.description}}
            </td>
            <td><small>{{submissionDate}}</small></td>
            <td width=150>
                <a href="&#35;{{stableURL}}" class="obs-count" id="observation-count-{{id}}">{{details}}</a>
                <div style="font-size:70%">[<a href="<%=dataURL%>submissions/{{displayName}}.zip">Download</a>]</div>
            </td>
        </tr>
    </script>

    <script type="text/template" id="submission-tmpl">
        <div class="container common-container" id="submission-container">
            <div class="row">
                <div class="col-10">
                    <h2>
                        Study
                    </h2>


                    <table id="submission-details-grid" class="table table-bordered table-striped">
                        <tr>
                            <th>Signature Type</th>
                            <td>{{observationTemplate.project}}</td>
                        </tr>
                        <tr>
                            <th>Description</th>
                            <td>{{observationTemplate.description}}</td>
                        </tr>
                        <tr id="similar-submission-info">
                            <th>Similar Studies</th>
                            <td>
                                <ul class="similar-submission-list"></ul>
                                [<a id='see-all-switch'></a>]
                            </td>
                        </tr>
                        <tr>
                            <th width="175">Publication Date</th>
                            <td>{{submissionDate}}</td>
                        </tr>
                        <tr>
                            <th>Source Data</th>
                            <td><a href="<%=dataURL%>submissions/{{displayName}}.zip" target=_blank>Download Study</a> |
                                <a href="./data/responseagents?submission={{id}}" target=_blank id=download-responseagents>Download all response agents</a></td>
                        </tr>
                    </table>
                </div>
                <div class="col-2">
                    <a href="&#35;{{observationTemplate.submissionCenter.stableURL}}">
                        <img src="img/{{observationTemplate.submissionCenter.displayName}}.png" class="img-polaroid" height=30 alt="{{observationTemplate.submissionCenter.displayName}}" title="{{observationTemplate.submissionCenter.displayName}}">
                    </a>

                    <br>
                    <br>

                    <img src="img/submission.png" class="img-polaroid" width=150 height=150 alt="Submission" title="Submission"><br>
                </div>
            </div>

            <div id="optional-submission-description">

            </div>

            <h3>Observations within this study</h3>

            <div class="more-observations-message"></div>

            <table id="submission-observation-grid" class="table table-bordered table-striped observations">
                <thead>
                <tr>
                    <th>Observation Summary</th>
                </tr>
                </thead>
                <tbody>
                <!-- here will go the rows -->
                </tbody>
            </table>
        </div>
    </script>

    <script type="text/template" id="submission-obs-tbl-row-tmpl">
        (<a class="button-link" href="&#35;{{stableURL}}">details &raquo;</a>)
    </script>

    <script type="text/template" id="submission-tbl-row-tmpl">
        <tr>
            <td id="submission-observation-summary-{{id}}">
                Loading...
            </td>
         /tr>
    </script>

    <script type="text/template" id="observation-tmpl">
        <div class="container common-container" id="observation-container">

            <div class="row">
                <div class="col-10">
                    <h2>Observation</h2>
                    <blockquote>
                        <p id="observation-summary"></p>
                    </blockquote>

                    <table id="observed-subjects-grid" class="table table-bordered table-striped subjects">
                        <thead>
                        <tr>
                            <th width="60">&nbsp;&nbsp;&nbsp;&nbsp;</th>
                            <th>Name</th>
                            <th>Class</th>
                            <th>Role</th>
                            <th>Description</th>
                        </tr>
                        </thead>
                        <tbody>
                        <!-- here will go the rows -->
                        </tbody>
                    </table>

                </div>
                <div class="col-2">
                    <a href="&#35;{{submission.observationTemplate.submissionCenter.stableURL}}"><img src="img/{{submission.observationTemplate.submissionCenter.displayName}}.png" class="img-polaroid" width="120" alt="{{submission.observationTemplate.submissionCenter.displayName}}"></a>
                    <br><br>
                    <img src="img/observation.png" alt="Observation" class="img-polaroid" width=120 height=120><br>
                </div>
            </div>

            <h3>Study <small>(<a href="#" id="small-show-sub-details">show details</a><a href="#" id="small-hide-sub-details">hide details</a>)</small></h3>
            <div id="obs-submission-details">
                <table id="obs-submission-details-grid" class="table table-bordered table-striped">
                    <tr>
                        <th>Signature Type</th>
                        <td>{{submission.observationTemplate.project}}</td>
                    </tr>
                    <tr>
                        <th>Description</th>
                        <td>
                            {{submission.observationTemplate.description}}
                            <small>(<a href="&#35;{{submission.stableURL}}">details &raquo;</a>)</small>
                        </td>
                    </tr>
                    <tr id="obs-submission-summary">
                        <th>Summary</th>
                        <td>{{submission.observationTemplate.submissionDescription}}</td>
                    </tr>
                    <tr>
                        <th>Publication Date</th>
                        <td>{{submission.submissionDate}}</td>
                    </tr>
                    <tr>
                        <th>Source Data</th>
                        <td><a href="<%=dataURL%>submissions/{{submission.displayName}}.zip" target=_blank>Download Study</a>
                    </tr>


                </table>
            </div>


            <h3>Evidence</h3>
            <table id="observed-evidences-grid" class="table table-bordered table-striped evidences">
                <thead>
                <tr>
                    <th>&nbsp;&nbsp;</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th width="150">Details</th>
                </tr>
                </thead>
                <tbody>
                <!-- here will go the rows -->
                </tbody>
            </table>

        </div>
    </script>

    <script type="text/template" id="similar-submission-item-tmpl">
        <li class={{toomany}}>
            <small><a href="&#35;{{stableURL}}">{{observationTemplate.description}}</a></small>
        </li>
    </script>

    <script type="text/template" id="submission-description-tmpl">
        <h3>Study summary</h3>
        <blockquote>
            <p>{{observationTemplate.submissionDescription}}</p>
        </blockquote>
    </script>

    <script type="text/template" id="summary-subject-replacement-tmpl">
        <a class="summary-replacement" href="&#35;{{stableURL}}">{{displayName}}</a></script>

    <script type="text/template" id="summary-evidence-replacement-tmpl">
        <strong class="summary-replacement">{{displayName}}</strong></script>

    <script type="text/template" id="observedevidence-row-tmpl">
        <tr>
            <td>&nbsp;&nbsp;</td>
            <td>{{observedEvidenceRole.evidenceRole.displayName}}</td>
            <td>{{observedEvidenceRole.displayText}}</td>
            <td>{{displayName}}</td>
        </tr>
    </script>

    <script type="text/template" id="observedfileevidence-row-tmpl">
        <tr>
            <td>
                <img src="img/icons/{{observedEvidenceRole.evidenceRole.displayName}}.png" class="img-rounded" title="{{observedEvidenceRole.evidenceRole.displayName}}" alt="{{observedEvidenceRole.evidenceRole.displayName}}">
            </td>
            <td>{{observedEvidenceRole.evidenceRole.displayName}}</td>
            <td>{{observedEvidenceRole.displayText}}</td>
            <td>(
                <a href="<%=dataURL%>{{evidence.filePath}}" target="_blank" title="Download file ({{evidence.mimeType}})" class="desc-tooltip" title="Download File">
                    download file
                </a>
            )</td>
        </tr>
    </script>

    <script type="text/template" id="observedhtmlfileevidence-row-tmpl">
        <tr>
            <td>
                <img src="img/icons/{{observedEvidenceRole.evidenceRole.displayName}}.png" class="img-rounded" title="{{observedEvidenceRole.evidenceRole.displayName}}" alt="{{observedEvidenceRole.evidenceRole.displayName}}">
            </td>
            <td>{{observedEvidenceRole.evidenceRole.displayName}}</td>
            <td>{{observedEvidenceRole.displayText}}</td>
            <td>(
                <a href="<%=dataURL%>{{evidence.filePath}}" title="View file ({{evidence.mimeType}})" class="desc-tooltip html-story-link" title="Download File">
                    view
                </a>
                )</td>
        </tr>
    </script>


    <script type="text/template" id="observedpdffileevidence-row-tmpl">
        <tr>
            <td>
                <img src="img/icons/{{observedEvidenceRole.evidenceRole.displayName}}.png" class="img-rounded" title="{{observedEvidenceRole.evidenceRole.displayName}}" alt="{{observedEvidenceRole.evidenceRole.displayName}}">
            </td>
            <td>{{observedEvidenceRole.evidenceRole.displayName}}</td>
            <td>{{observedEvidenceRole.displayText}}</td>
            <td>(
                <a href="<%=dataURL%>{{evidence.filePath}}" target="_blank" title="{{observedEvidenceRole.displayText}}" class="desc-tooltip pdf-file-link">
                    view PDF
                </a>
                )</td>
        </tr>
    </script>

    <script type="text/template" id="observedgctfileevidence-row-tmpl">
        <tr>
            <td>
                <img src="img/icons/{{observedEvidenceRole.evidenceRole.displayName}}.png" class="img-rounded" title="{{observedEvidenceRole.evidenceRole.displayName}}" alt="{{observedEvidenceRole.evidenceRole.displayName}}">
            </td>
            <td>{{observedEvidenceRole.evidenceRole.displayName}}</td>
            <td>{{observedEvidenceRole.displayText}}</td>
            <td>
                <div class="dropdown">
                    ( <a class="dropdown-toggle" data-toggle="dropdown" href="#">view file <b class="caret"></b></a> )
                    <ul class="dropdown-menu" role="menu" aria-labelledby="dLabel">
                        <li>
                            <a href="http://www.broadinstitute.org/cancer/software/GENE-E/dynamic.php?data=<%=dataURL%>{{evidence.filePath}}" target="_blank" title="open in GENE-E (Java Web-start)" class="desc-tooltip">
                                open with GENE-E
                            </a>
                        </li>
                        <li>
                            <a href="<%=dataURL%>{{evidence.filePath}}" class="desc-tooltip" target="_blank" title="type: ({{evidence.mimeType}})">view in browser</a>
                        </li>

                    </ul>
                </div>
            </td>
        </tr>
    </script>

    <script type="text/template" id="observedsiffileevidence-row-tmpl">
        <tr>
            <td>
                <img src="img/icons/{{observedEvidenceRole.evidenceRole.displayName}}.png" class="img-rounded" title="{{observedEvidenceRole.evidenceRole.displayName}}" alt="{{observedEvidenceRole.evidenceRole.displayName}}">
            </td>
            <td>{{observedEvidenceRole.evidenceRole.displayName}}</td>
            <td>{{observedEvidenceRole.displayText}}</td>
            <td>
                <div class="dropdown">
                    ( <a class="dropdown-toggle" data-toggle="dropdown" href="#">view file <b class="caret"></b></a> )
                    <ul class="dropdown-menu" role="menu" aria-labelledby="dLabel">
                        <li>
                            <a href="#" data-description="{{observedEvidenceRole.displayText}}" data-sif-url="<%=dataURL%>{{evidence.filePath}}" target="_blank" title="open in Cytoscape.js" class="desc-tooltip cytoscape-view">
                                interactive network view
                            </a>
                        </li>
                        <li>
                            <a href="<%=dataURL%>{{evidence.filePath}}" class="desc-tooltip" target="_blank" title="type: ({{evidence.mimeType}})">view in browser</a>
                        </li>
                    </ul>
                </div>
            </td>
        </tr>
    </script>

    <script type="text/template" id="observedimageevidence-row-tmpl">
        <tr>
            <td>
                <img src="img/icons/{{observedEvidenceRole.evidenceRole.displayName}}.png" class="img-rounded" title="{{observedEvidenceRole.evidenceRole.displayName}}" alt="{{observedEvidenceRole.evidenceRole.displayName}}">
            </td>
            <td>{{observedEvidenceRole.evidenceRole.displayName}}</td>
            <td>{{observedEvidenceRole.displayText}}</td>
            <td>
                <div class="image-evidence-wrapper">
                    <a href="<%=dataURL%>{{evidence.filePath}}" target="_blank" data-caption="{{observedEvidenceRole.displayText}}" rel="evidence-images" class="evidence-images">
                        <img src="<%=dataURL%>{{evidence.filePath}}" class="img-polaroid img-evidence" height="140" title="File" alt="File">
                    </a>
                </div>
            </td>
        </tr>
    </script>


    <script type="text/template" id="observedlabelevidence-row-tmpl">
        <tr>
            <td>
                <img src="img/icons/{{observedEvidenceRole.evidenceRole.displayName}}.png" class="img-rounded" title="{{observedEvidenceRole.evidenceRole.displayName}}" alt="{{observedEvidenceRole.evidenceRole.displayName}}">
            </td>
            <td>{{observedEvidenceRole.evidenceRole.displayName}}</td>
            <td>{{observedEvidenceRole.displayText}}</td>
            <td><div class="labelevidence expandable">{{displayName}}</div></td>
        </tr>
    </script>

    <script type="text/template" id="observedurlevidence-row-tmpl">
        <tr>
            <td>
                <img src="img/icons/{{observedEvidenceRole.evidenceRole.displayName}}.png" class="img-rounded" title="{{observedEvidenceRole.evidenceRole.displayName}}" alt="{{observedEvidenceRole.evidenceRole.displayName}}">
            </td>
            <td>{{observedEvidenceRole.evidenceRole.displayName}}</td>
            <td>{{observedEvidenceRole.displayText}}</td>
            <td>
                (<a href="{{evidence.url.replace(/^\//, '')}}" target="_blank" class="desc-tooltip" title="Open link in a new window">
                    open link
                </a>)
            </td>
        </tr>
    </script>

    <script type="text/template" id="observeddatanumericevidence-row-tmpl">
        <tr>
            <td>
                <img src="img/icons/{{observedEvidenceRole.evidenceRole.displayName}}.png" class="img-rounded" title="{{observedEvidenceRole.evidenceRole.displayName}}" alt="{{observedEvidenceRole.evidenceRole.displayName}}">
            </td>
            <td>{{observedEvidenceRole.evidenceRole.displayName}}</td>
            <td>{{observedEvidenceRole.displayText}}</td>
            <td><span class="numeric-value">{{evidence.numericValue}}</span> <em>{{evidence.unit}}</em></td>
        </tr>
    </script>

    <script type="text/template" id="observeddatanumericevidence-val-tmpl">
        {{firstPart}} &times; 10<sup>{{secondPart}}</sup>
    </script>

    <script type="text/template" id="gene-uniprot-tmpl">
        <li id="gene-uniprot-link">
            UniProt: <a href="http://www.uniprot.org/uniprot/{{uniprotId}}" target="_blank">{{uniprotId}} <i class="icon-share"></i></a>
        </li>
    </script>

    <script  type="text/template" id="related-observations-tmpl">
        <h3>Related observations</h3>

        <div class="more-observations-message"></div>

        <table id="related-observation-grid" class="table table-bordered table-striped observations">
            <thead>
            <tr>
                <th>Publication Date</th>
                <th width=500>Observation Summary</th>
                <th>PMID</th>
            </tr>
            </thead>
            <tbody>
            <!-- here will go the rows -->
            <tr class="subject-observations-loading">
                <td colspan="5">
                    <h3>Loading observations...</h3>
                    <div class="progress progress-striped active">
                        <div class="bar" style="width: 100%;"></div>
                    </div>
                </td>
            </tr>
            </tbody>
        </table>

    </script>

    <script type="text/template" id="pathogen-tmpl">
        <div class="container common-container" id="pathogen-container">
            <h2>{{displayName}}</h2>

            <div class="row">
                <div class="col-9">
                    <table id="pathogen-details-grid" class="table table-bordered table-striped">
                        <tr><th>Taxonomy ID</th><td>{{taxonomyId}}</td></tr>
                        <tr><th>Rank</th><td>{{rank}}</td></tr>
                        <tr><th>Broad Synonyms</th><td><ul id="synonyms"></ul></td></tr>
                        <tr><th>Exact Synonyms</th><td><ul id="exactSynonyms"></ul></td></tr>
                        <tr><th>Related Synonyms</th><td><ul id="relatedSynonyms"></ul></td></tr>
                        <tr><th>References</th>
                            <td>Taxonomy ID: <a href="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id={{taxonomyId}}" target="_blank">{{taxonomyId}}</a>
                        </tr>
                    </table>
                </div>
                <div class="col-3">
                    <h4>Pathogen</h4>
                    <img src="img/pathogen.png" class="img-polaroid" width=175 height=175 alt="Pathogen">
                </div>
            </div>

            <div id=related-observations></div>
        </div>
    </script>

    <script type="text/template" id="cellsubset-tmpl">
        <div class="container common-container" id="cellsubset-container">
            <h2>{{displayName}}</h2>

            <div class="row">
                <div class="col-9">
                    <table id="gene-details-grid" class="table table-bordered table-striped">
                        <tr><th>Cell Ontology ID</th><td>{{cellOntologyId}}</td></tr>
                        <tr><th>Definition</th><td>{{definition}}</td></tr>
                        <tr><th>Comment</th><td>{{comment}}</td></tr>
                        <tr><th>Broad Synonyms</th><td><ul id="synonyms"></ul></td></tr>
                        <tr><th>Exact Synonyms</th><td><ul id="exactSynonyms"></ul></td></tr>
                        <tr><th>Related Synonyms</th><td><ul id="relatedSynonyms"></ul></td></tr>
                        <tr><th>References</th>
                            <td>Cell Ontology: <a href="http://purl.obolibrary.org/obo/{{cellOntologyId}}" target="_blank">{{cellOntologyId}}</a>
                        </tr>
                    </table>
                </div>
                <div class="col-3">
                    <h4>Cell Subset</h4>
                    <img src="img/cellsubset.png" class="img-polaroid" width=175 height=175 alt="Cell Subset">
                </div>
            </div>

            <div id=related-observations></div>
        </div>
    </script>

    <script type="text/template" id="vaccine-tmpl">
        <div class="container common-container" id="vaccine-container">
            <h2>{{displayName}}</h2>

            <div class="row">
                <div class="col-9">
                    <table id="gene-details-grid" class="table table-bordered table-striped">
                        <tr><th>Vaccine ID</th><td>{{vaccineID}}</td></tr>
                        <tr><th>Product Name</th><td>{{productName}}</td></tr>
                        <tr><th>Trade Name</th><td>{{tradeName}}</td></tr>
                        <tr><th>References</th>
                            <td>
                            Vaccine Ontology by vaccine ID: <a href="http://purl.obolibrary.org/obo/{{vaccineID}}" target="_blank">{{vaccineID}}</a><br/>
                            EBI-EMBL Ontology Lookup Service: <a href="https://www.ebi.ac.uk/ols/ontologies/vo/terms?iri=http%3A%2F%2Fpurl.obolibrary.org%2Fobo%2F{{vaccineID}}" target="_blank">{{vaccineID}}</a><br/>
                            Violinet Vaxquery by display name: <a href="http://www.violinet.org/vaxquery/vaxquery_results.php?searchEngine=vaxquery&keywords={{displayName}}" target="_blank">{{displayName}}</a><br/>
                            Violinet Vaxquery by vaccine ID: <a href="http://www.violinet.org/vaxquery/vaxquery_results.php?searchEngine=vaxquery&keywords={{vaccineID}}" target="_blank">{{vaccineID}}</a>
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="col-3">
                    <h4>Vaccine</h4>
                    <img src="img/vaccine.png" class="img-polaroid" width=175 height=175 alt="Vaccine">
                </div>
            </div>

            <div id=related-observations></div>
        </div>
    </script>

    <script type="text/template" id="gene-tmpl">
        <div class="container common-container" id="gene-container">
             <h2>{{displayName}}</h2>

             <div class="row">
                 <div class="col-9">
                     <table id="gene-details-grid" class="table table-bordered table-striped">
                         <tr>
                             <th>Gene symbol<div style="font-size:10px; font-style:italic">(from HGNC)</div></th>
                             <td>{{displayName}}&nbsp;&nbsp;
                                  <a href="#" class="addGene-{{displayName}} greenColor" title="Add gene to cart">+</a>  
                             </td>
                         </tr>
                         <tr><th>Gene Name</th><td>{{fullName}}</td></tr>
                         <tr><th>Gene Type</th><td>{{geneType.displayName}}</td></tr>
                         <tr><th>Map Location</th><td>{{mapLocation}}</td></tr>
                         <tr>
                             <th>Synonyms/Related terms<div style="font-size:10px; font-style:italic">(from Entrez)</div></th>
                             <td>
                                 <ul class="synonyms"></ul>
                             </td>
                         </tr>
                         <tr>
                             <th>Organism</th>
                             <td>{{organism.displayName}}</td>
                         </tr>
                         <tr>
                             <th>References</th>
                             <td>
                                 <ul class="refs">
                                     <li>
                                         Entrez: <a href="http://www.ncbi.nlm.nih.gov/gene/{{entrezGeneId}}" target="_blank">{{entrezGeneId}} <i class="icon-share"></i></a>
                                     </li>
                                 </ul>
                             </td>
                         </tr>
                     </table>
                 </div>
                 <div class="col-3">
                     <h4>Gene</h4>
                     <img src="img/gene.png" class="img-polaroid" width=175 height=175 alt="Gene">
                 </div>
             </div>

             <div id=related-observations></div>
         </div>
    </script>

    <script type="text/template" id="protein-tmpl">
        <div class="container common-container" id="protein-container">
            <h2>{{displayName}}</h2>

            <div class="row">
                <div class="col-9">
                    <table id="protein-details-grid" class="table table-bordered table-striped">
                        <tr>
                            <th>Gene symbol<div style="font-size:10px; font-style:italic">(from HGNC)</div></th>
                            <td>{{displayName}}</td>
                        </tr>
                        <tr>
                            <th>Synonyms/Related terms<div style="font-size:10px; font-style:italic">(from Entrez)</div></th>
                            <td>
                                <ul class="synonyms"></ul>
                            </td>
                        </tr>
                        <tr>
                            <th>Transcripts</th>
                            <td>
                                <ul class="transcripts"></ul>
                            </td>
                        </tr>
                        <tr>
                            <th>Organism</th>
                            <td>{{organism.displayName}}</td>
                        </tr>
                        <tr>
                            <th>References</th>
                            <td>
                                Uniprot ID: <a href="https://www.uniprot.org/uniprot/{{uniprotId}}" target="_blank">{{uniprotId}} <i class="icon-share"></i></a> <br>
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="col-3">
                    <h4>Protein</h4>
                    <img src="img/protein.png" class="img-polaroid" width=175 height=175 alt="Protein">
                </div>
            </div>

            <div id=related-observations></div>
        </div>
    </script>

    <script type="text/template" id="rna-tmpl">
        <div class="container common-container" id="shrna-container">
            <h2>{{displayName}}</h2>

            <div class="row">
                <div class="col-9">
                    <table id="shrna-details-grid" class="table table-bordered table-striped">
                        <tr>
                            <th>Target Sequence</th>
                            <td>{{targetSequence}}</td>
                        </tr>
                        <tr>
                            <th>Target Transcript</th>
                            <td>
                                <a href="&#35;{{transcript.stableURL}}">{{transcript.refseqId}}</a>
                            </td>
                        </tr>
                        <tr>
                            <th>Target Gene</th>
                            <td>
                                <a href="&#35;{{transcript.gene.stableURL}}">{{transcript.gene.displayName}}</a>
                            </td>
                        </tr>
                        <tr>
                            <th>Organism</th>
                            <td>{{organism.displayName}}</td>
                        </tr>
                    </table>
                </div>
                <div class="col-3">
                    <h4>{{type=='sirna'?'siRNA':'shRNA'}}</h4>
                    <img src="img/{{type}}.png" class="img-polaroid" width=175 height=175 alt="{{type=='sirna'?'siRNA':'shRNA'}}">
                </div>
            </div>

            <div id=related-observations></div>
        </div>
    </script>

    <script type="text/template" id="transcript-tmpl">
        <div class="container common-container" id="transcript-container">
            <h2>{{refseqId}}</h2>

            <div class="row">
                <div class="col-9">
                    <table id="transcript-details-grid" class="table table-bordered table-striped">
                        <tr>
                            <th>Gene</th>
                            <td>
                                <a href="&#35;{{gene.stableURL}}">{{gene.displayName}}</a>
                            </td>
                        </tr>
                        <tr>
                            <th>Organism</th>
                            <td>{{organism.displayName}}</td>
                        </tr>
                        <tr>
                            <th>References</th>
                            <td>
                                Entrez: <a href="http://www.ncbi.nlm.nih.gov/nuccore/{{refseqId}}" target="blank">{{refseqId}} <i class="icon-share"></i></a>
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="col-3">
                    <h4>Transcript</h4>
                    <img src="img/transcript.png" class="img-polaroid" width=175 height=175 alt="Transcript">
                </div>
            </div>

            <div id=related-observations></div>
        </div>
    </script>

    <script type="text/template" id="tissuesample-tmpl">
        <div class="container common-container" id="tissuesample-container">
            <h2>{{displayName}}</h2>

            <div class="row">
                <div class="col-9">
                    <table id="tissuesample-details-grid" class="table table-bordered table-striped">
                        <tr>
                            <th>Lineage</th>
                            <td>{{lineage}}</td>
                        </tr>
                        <tr id="tissue-synonyms">
                            <th>Synonyms</th>
                            <td>
                                <ul class="synonyms"></ul>
                            </td>
                        </tr>
                        <tr id="tissue-refs">
                            <th>References</th>
                            <td>
                                <ul class="xrefs"></ul>
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="col-3">
                    <h4>Tissue Sample</h4>
                    <img src="img/tissuesample.png" class="img-polaroid" width=175 height=175 alt="Tissue sample">
                </div>
            </div>

            <div id=related-observations></div>
        </div>
    </script>

    <script type="text/template" id="cellsample-tmpl">
        <div class="container common-container" id="cellsample-container">
            <h2>{{displayName}}</h2>
            <div class="row">
                <div class="col-9">
                    <table id="cellsample-details-grid" class="table table-bordered table-striped">
                        <tr>
                            <th>Name</th>
                            <td>{{displayName}}</td>
                        </tr>
                        <tr>
                            <th>Synonyms</th>
                            <td>
                                <ul class="synonyms"></ul>
                            </td>
                        </tr>
                        <tr>
                            <th>Organism</th>
                            <td>{{organism.displayName}}</td>
                        </tr>
                        <tr>
                            <th>Annotations</th>
                            <td id="annotations">
                                <ul></ul>
                            </td>
                        </tr>
                        <tr id="cbiolink">
                            <th>Genomic alterations</th>
                            <td>
                                <a class="btn btn-small" href="http://www.cbioportal.org/public-portal/case.do?cancer_study_id=cellline_ccle_broad&sample_id={{cbioPortalId}}" target="blank">view in cBioPortal <i class="icon-share"></i></a>
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="col-3">
                        <h4>Cell Sample</h4>
                        <img src="img/cellsample.png" class="img-polaroid" width=175 height=175 alt="Cell sample">
                </div>
            </div>

            <div id=related-observations></div>
        </div>
    </script>

    <script type="text/template" id="animalmodel-tmpl">
        <div class="container common-container" id="animalmodel-container">
            <h2>{{displayName}}</h2>
            <div class="row">
                <div class="col-9">
                    <table id="animalmodel-details-grid" class="table table-bordered table-striped">
                        <tr>
                            <th>Name</th>
                            <td>{{displayName}}</td>
                        </tr>
                        <tr>
                            <th>Synonyms</th>
                            <td>
                                <ul class="synonyms"></ul>
                            </td>
                        </tr>
                        <tr>
                            <th>Organism</th>
                            <td>{{organism.displayName}}</td>
                        </tr>
                    </table>
                </div>
                <div class="col-3">
                    <h4>Animal Model</h4>
                    <img src="img/animalmodel.png" class="img-polaroid" width=175 height=175 alt="Animal model">
                </div>
            </div>

            <div id=related-observations></div>
        </div>
    </script>

    <script type="text/template" id="compound-tmpl">
        <div class="container common-container" id="compound-container">
              <h2>{{displayName}}</h2>

              <div class="row">
                  <div class="col-9">
                      <table id="compund-details-grid" class="table table-bordered table-striped">
                          <tr>
                              <th>Name</th>
                              <td>{{displayName}}</td>
                          </tr>
                          <tr>
                              <th>Synonyms</th>
                              <td>
                                  <ul class="synonyms"></ul>
                              </td>
                          </tr>
                          <tr>
                              <th>SMILES</th>
                              <td><small>{{smilesNotation}}</small></td>
                          </tr>
                          <tr>
                              <th>References</th>
                              <td>
                                  <ul class="compound-xrefs">
                                      {{pubchem ? "<li>PubChem: <a target='_blank' href='https://pubchem.ncbi.nlm.nih.gov/compound/" + pubchem + "'>" + pubchem + "</a> <i class='icon-share'></i></li>" : ""}}
                                      {{cas ? "<li>CAS: " + cas + "</li>" : ""}}

                                  </ul>
                              </td>
                          </tr>
                      </table>
                  </div>
                  <div class="col-3">
                      <h4>Compound</h4>
                      <a href="<%=dataURL%>compounds/{{imageFile}}" target="_blank" class="compound-image" title="Compound: {{displayName}}">
                        <img class="img-polaroid" width=200 src="<%=dataURL%>compounds/{{imageFile}}" alt="Compound: {{displayName}}">
                      </a>
                  </div>
              </div>

              <div id=related-observations></div>
          </div>
     </script>

    <script type="text/template" id="observedsubject-summary-row-tmpl">
        <tr>
            <td id="subject-image-{{id}}"></td>
            <td>
                <a href="&#35;{{subject.stableURL}}">
                    {{subject.displayName}}
                </a>
            </td>
            <td>{{subject.type}}</td>
            <td>{{observedSubjectRole.subjectRole.displayName}}</td>
            <td>{{observedSubjectRole.displayText}}</td>
        </tr>
    </script>

    <script type="text/template" id="observedsubject-gene-summary-row-tmpl">
        <tr>
            <td id="subject-image-{{id}}"></td>
            <td id="subject.displayName-{{id}}">
                <a href="&#35;{{subject.stableURL}}">
                    {{subject.displayName}}
                </a>  &nbsp;
                <a href="#" class="addGene-{{subject.displayName}} greenColor" title="Add gene to cart" >+</a>			  				 
            </td>
            <td>{{subject.type}}</td>
            <td>{{observedSubjectRole.subjectRole.displayName}}</td>
            <td>{{observedSubjectRole.displayText}}</td>
        </tr>
    </script>

    <script type="text/template" id="observation-row-tmpl">
        <tr>
            <td>
                <a href="&#35;{{stableURL}}">
                    {{submission.submissionDate}}
                </a>
            </td>
            <td id="observation-summary-{{id}}">
                Loading...
            </td>
            <td>{{pmid}}</td>
        </tr>
    </script>

    <script type="text/template" id="search-empty-tmpl">
        <tr>
            <td colspan="7">
                <div class="alert alert-error">
                    <button type="button" class="close" data-dismiss="alert">&times;</button>
                    <h3>Sorry, no results found</h3>
                    <p>
                        Would you like to extend your search with a wildcard?
                        (<i>e.g.</i> <a href="#/search/{{encodeURIComponent(term)}}*">{{decodeURIComponent(term)}}*</a>)
                    </p>
                </div>
            </td>
        </tr>
    </script>

    <script type="text/template" id="html-story-container-tmpl">
        <div class="fancy-story-container">
            <img src="img/{{centerName}}.png" alt="{{centerName}}" title="{{centerName}}" height="50" class="fancy-story-img img-polaroid">
            {{story}}
        </div>
    </script>

    <script type="text/template" id="search-results-image-tmpl">
        <a href="&#35;{{stableURL}}">
            <img src="{{image}}" class="img-polaroid search-info" title="{{label}}" alt="{{label}}" height="50" width="50">
        </a>
    </script>

    <script type="text/template" id="search-result-row-tmpl">
        <tr>
            <td id="search-image-{{dashboardEntity.id}}"></td>
            <td>
                <a href="&#35;{{dashboardEntity.stableURL}}/{{role}}">{{dashboardEntity.displayName}}</a><br>
                <i>{{dashboardEntity.organism.displayName != '-' ? "(" + dashboardEntity.organism.displayName + ")" : ""}}</i>
            </td>
            <td>
                <ul id="synonyms-{{dashboardEntity.id}}">
                    <!-- here will go the synonyms -->
                </ul>
            </td>
            <td>{{dashboardEntity.class}}</td>
            <td>{{role}}</td>
            <td class="nonewline">
                <a href="&#35;{{dashboardEntity.stableURL}}/{{role}}" id="subject-observation-count-{{dashboardEntity.id}}" count="{{observationCount}}">{{observationCount}}</a>
                <i class="icon-question-sign obs-tooltip {{observationCount < 1 ? 'hide' : ''}}" title="{{observationCount}} observations from {{centerCount}} centers"></i>
            </td>
        </tr>
    </script>

    <script type="text/template" id="search-result-gene-row-tmpl">
        <tr>
            <td id="search-image-{{dashboardEntity.id}}"></td>
            <td>
                <a href="&#35;{{dashboardEntity.stableURL}}">{{dashboardEntity.displayName}}</a>
                <a href="#" class="addGene-{{dashboardEntity.displayName}} greenColor" title="Add gene to cart" >+</a>
                <br>
                <i>{{dashboardEntity.organism.displayName != '-' ? "(" + dashboardEntity.organism.displayName + ")" : ""}}</i>
            </td>
            <td>
                <ul id="synonyms-{{dashboardEntity.id}}">
                    <!-- here will go the synonyms -->
                </ul>
            </td>
            <td>{{dashboardEntity.type}}</td>
            <td>gene_biomarker</td>
            <td class="nonewline">
                <a href="&#35;{{dashboardEntity.stableURL}}" id="subject-observation-count-{{dashboardEntity.id}}" count="{{observationCount}}">{{observationCount}}</a>
                <i class="icon-question-sign obs-tooltip {{observationCount < 1 ? 'hide' : ''}}" title="{{observationCount}} observations from {{centerCount}} centers"></i>
            </td>
        </tr>
    </script>

    <script type="text/template" id="search-tmpl">
        <div class="container common-container" id="search-results-container">
            <h2>Search <small>for <i>{{decodeURIComponent(term)}}</i></small></h2>

            <table id="search-results-grid" class="table table-bordered table-striped">
                <thead>
                <tr>
                    <th>&nbsp; &nbsp;</th>
                    <th>Name</th>
                    <th>Synonyms</th>
                    <th>Type</th>
                    <th>Roles</th>
                    <th>Observations</th>
                </tr>
                </thead>
                <tbody>
                <!-- here will go the rows -->
                <tr id="loading-row">
                    <td colspan="7">
                        <h3>Searching...</h3>
                        <div class="progress progress-striped active">
                            <div class="bar" style="width: 100%;"></div>
                        </div>
                    </td>
                </tr>
                </tbody>
            </table>

            <div id="submission-search-results">
                <h3>Study Descriptions Matching any Search Term</h3>
                <table id="searched-submissions" class="table table-bordered table-striped">
                    <thead>
                    <tr>
                        <th>&nbsp; &nbsp;</th>
                        <th>Publication Date</th>
                        <th>Description</th>
                        <th>Details</th>
                    </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>

            <div id="observation-search-results">
                <h3><span id=observation-search-title>Observations Matching all Search Terms</span></h3>
                <table id="searched-observation-grid" class="table table-bordered table-striped observations">
                    <thead>
                    <tr>
                        <th>Publication Date</th>
                        <th width=500>Observation Summary</th>
                        <th>PMID</th>
                    </tr>
                    </thead>
                    <tbody>
                    <!-- here will go the rows -->
                    <tr class="subject-observations-loading">
                        <td colspan="5">
                            <h3>Loading observations...</h3>
                            <div class="progress progress-striped active">
                                <div class="bar" style="width: 100%;"></div>
                            </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </script>

    <script type="text/template" id="search-submission-tbl-row-tmpl">
        <tr>
            <td><a href="&#35;{{dashboardEntity.stableURL}}"><img src="img/submission.png" width="50" alt="Submission" title="Submission"></a></td>
            <td><a href="&#35;{{dashboardEntity.stableURL}}">{{dashboardEntity.submissionDate}}</a></td>
            <td>{{dashboardEntity.observationTemplate.description}}</td>
            <td width=150>
                <a href="&#35;{{dashboardEntity.stableURL}}" id="search-observation-count-{{dashboardEntity.id}}">{{observationCount}} observations</a>
            </td>
        </tr>
    </script>

    <script type="text/template" id="synonym-item-tmpl">
        <li class="synonym"><small>{{displayName}}</small></li>
    </script>

    <script type="text/template" id="transcript-item-tmpl">
        <li class="synonym"><a href="&#35;{{stableURL}}">{{refseqId}}</a></li>
    </script>

    <script type="text/template" id="count-story-tmpl">
        Read story
    </script>

    <script type="text/template" id="count-observations-tmpl">
        {{count}} observation{{count == 1 ? "" : "s"}}
    </script>

    <script type="text/template" id="cytoscape-tmpl">
        <div id="cytoscape-sif"></div>
        <div class="well sif-legend">
            {{description}}
        </div>
    </script>

    <script type="text/template" id="text-blurb">
        <div class="alert alert-warning">
            <button type="button" class="close" data-dismiss="alert">&times;</button>
            <p>
                Entries listed below are ordered by number of observations.
            </p>
        </div>
    </script>

    <script type="text/template" id="explore-tmpl" data-url="<%=dataURL%>">
        <div class="container common-container" id="explore-container">
            <!-- this had to be changed because we need the label to be different from the roles for the actual query as in CTD2 dashboard -->
            <h2>Explore: <i>{{roles_label}}</i></h2>

            <div id="explore-blurb"></div>

            <div style="width:50%" id=loading-spinner>
            <div class="d-flex align-items-center">
                <strong>Loading...</strong>
                <div class="spinner-border ml-auto" role="status" aria-hidden="true"></div>
            </div>
            </div>
            <table class="table table-bordered table-striped observations" id="explore-table">
                <thead>
                <tr>
                    <th>Class</th>
                    <th>Name</th>
                    <th>Observations</th>
                </tr>
                </thead>
                <tbody id="explore-items" style='white-space: nowrap;'>
                    <!-- here will go the rows -->
                </tbody>
            </table>

        </div>

        <div class="modal hide fade" id="role-modal">
        <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Select roles</h3>
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            </div>
            <div class="modal-body">
                <p>Please select roles of interest from the list below.</p>

                <table class="table table-bordered table-compact table-striped" id="customized-roles-tbl">
                    <thead>
                        <tr>
                            <th>Role</th>
                            <th>Show</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
            <div class="modal-footer">
                <button type="btn btn-block btn-info" id="select-roles-button">Select</button>
            </div>
        </div>
        </div>
        </div>
    </script>

    <script type="text/template" id="gene-explore-tmpl" data-url="<%=dataURL%>">
        <div class="container common-container" id="gene-explore-container">
            <h2>Explore: <i>{{roles_label}}</i></h2>

            <div id="gene-explore-blurb"></div>

            <table class="table table-bordered table-striped observations" id="gene-explore-table">
                <thead>
                <tr>
                    <th>Class</th>
                    <th>Name</th>
                    <th>Observations</th>
                </tr>
                </thead>
                <tbody id="gene-explore-items" style='white-space: nowrap;'>
                    <!-- here will go the rows -->
                </tbody>
            </table>
        </div>
    </script>

    <script type="text/template" id="customize-roles-item-tmpl">
        <tr>
            <td>{{displayName}}</td>
            <td><input {{checked ? "checked " : ""}} type="checkbox" data-role="{{displayName}}"></td>
        </tr>
    </script>

    <script type="text/template" id="more-observations-tmpl">
        <div class="alert alert-warning">
            <button type="button" class="close" data-dismiss="alert">&times;</button>
            <p>
                Only {{numOfObservations}} of {{numOfAllObservations}} observations are listed in the table below.
                Enter text to filter among <b>all</b> observations: <input id=filter_text />
                <button id=filter_button>Filter</button>
                <span id=filtered_number></span>
                <button id=load-filtered style="display: none;">Load the observations</button>
            </p>
        </div>
    </script>


    <script type="text/template" id="more-projects-tmpl">
        <div class="alert alert-warning">
            <p><a href="#" class="close" data-dismiss="alert">&times;</a></p>
            <p>
                The table below lists all studies that belong to the project "<b>{{filterProject}}</b>".
                To view all studies, please click <a href="&#35;{{centerStableURL}}">here</a>.
            </p>
        </div>
    </script>

    <script type="text/template" id="ncithesaurus-tmpl">
        <li>
            <a href="http://ncit.nci.nih.gov/ncitbrowser/ConceptReport.jsp?dictionary=NCI_Thesaurus&code={{nciId}}" target="_blank">
                NCI Thesaurus: {{nciId}}
            </a>
        </li>
    </script>

    <script type="text/template" id="annotation-tmpl">
        <li><small>{{displayName}} ({{source}})</small></li>
    </script>

    <script type="text/template" id="maxNumberOfEntites">
        <%=maxNumOfObservations%>
    </script>

    <script type="text/template" id="genelist-view-tmpl">
        <div class="container common-container" id="genelist-container" > 
            <div class=row>
                <div class="col-10" align="center">
                    <h4>  Gene List</h4>

                     <div class="alert alert-warning">
                         <button type="button" class="close" data-dismiss="alert">&times;</button>
                           <p>
                             The Gene Cart allows users to build a list of genes and query the Cellular Networks Knowledge Base (CNKB) for molecular interactions involving these genes.  The CNKB is a database of gene interaction networks maintained at Columbia University [
                             <a href="#gene-cart-help">More Details</a>
                             ].
                           </p>
                     </div>

                    <select id="geneNames" class="geneSelectList" size="6" 
								multiple></select>
                    </br></br>
                    <a href="#" id="addGene">Add Gene</a>
                    <a href="#" id="deleteGene">Delete Gene</a>
                    </br></br>
                    <a href="#" id="clearList">Clear List</a>
                    <a href="#" id="loadGenes">Load Genes from File</a>
                    </br><input id="geneFileInput" type="file" style="visibility:hidden" /> 
                    </br>
                    <a href="#cnkb-query" id="cnkb-query">Find Gene Interactions in  Networks (CNKB)</a>
                 </div>

                 <div class="col-1">
                    <a href="javascript:history.back()">Back</a>
                 </div>
            </div>
        </div>

        <div class="modal hide fade" id="addgene-modal">
        <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-body">
                    <br>
                    Add gene symbols
                    <input id="gene-symbols" placeholder="e.g. CTNNB1" class="input-xlarge">
                    <button id="add-gene-symbols" class="btn">Submit</button><br><br>
            </div>
            <div class="modal-footer">
                    <button class="btn btn-primary" data-dismiss="modal">Close</button>
            </div>
        </div>
        </div>
        </div>
      </script>

    <script type="text/template" id="cnkb-query-tmpl">
        <div class="container common-container" id="cnkbquery-container" > 
            <div class=row>
                    <div class="col-10">
                       <h3>Cellular Network Knowledge Base</h3>

                       <medium>Select Interactome:</medium>
                       <small id="queryDescription" class="cnkbDescription"></small> 
                       </br>
                       <select id="interactomeList" name="interactomes"
						    class="cnkbSelectList" size="4"></select>
                       </br>
                       <small id="interactomeDescription" class="cnkbDescription">
                        &nbsp;&nbsp;
                       </small>
                     </br></br>
                      
                    <medium class="labelDisable" id="selectVersion"> Select Version: </medium>
                    </br>
                    <select id="interactomeVersionList" name="interactomeVersions"
						 class="cnkbSelectList" size="4"></select>
                     </br>
                    <small id="versionDescription" class="cnkbDescription">
                        &nbsp;&nbsp;
                    </small>
                     </br>
		             </br>
                     <a href="#cnkb-result" id="cnkb-result">Submit</a>
                 </div>

                 <div class="col-1">
                    <a href="javascript:history.back()">Back</a>
                 </div>
             </div>
        </div>
      </script>

    <script type="text/template" id="cnkb-result-tmpl">
        <div class="container common-container" id="cnkbresult-container" > 
               <div class="row">
                  <div class="col-10">
                     <h2>Cellular Network Knowledge Base</h2>
                     <a href="#" id="cnkbExport"  target="_blank" title="Export all selected interaction to a SIF file."> Export </a>
                     <br>
                     <form method="POST" action="cnkb/download" id="cnkbExport-form" style="display: none;">
                             <input type="hidden" name="interactome" id="interactome">
                             <input type="hidden" name="version" id="version">
                             <input type="hidden" name="selectedGenes" id="selectedGenes">
                             <input type="hidden" name="interactionLimit" id="interactionLimit">
                             <input type="hidden" name="throttle" id="throttle">
                     </form>
                     <table id="cnkb-result-grid" class="table table-bordered table-striped ">
                        <thead> 
                            <tr>
                            <th><input type="checkbox" id="checkbox_selectall" title="select or deselect all checkboxs"></th>
                            <th>GENE</th>
                            </tr>
                         </thead>
                         <tbody>
                         </tbody>
                      </table>  
                   </div>
                   <div class="col-1">
                      <a href="javascript:history.back()">Back</a>
                   </div>
                </div>
                <br/>

                <div id="cnkb_data_progress" align="center">data is loading ......
                    <img id="cnkb_data_progress_indicator" src="img/progress_indicator.gif" width="20" height="20" alt="Please wait ......"><br>
                    <br/><br/><br/>
                </div>
                <div>
					<b>Interactions Limit:</b>	
                    <select id="cytoscape-node-limit">
                           <option value="25">25</option>
                           <option value="50">50</option>
                           <option value="100" selected="selected">100</option>
                           <option value="200">200</option>
                           <option value="300">300</option>
                           <option value="400">400</option>
                     </select>
				  
                     <b>Layout:</b>	
                     <select id="cytoscape-layouts">
                           <option value="cola" selected="selected">Cola</option>
                           <option value="grid">Grid</option>
                           <option value="random">Random</option>
                           <option value="circle">Circle</option>
                     </select>
                     
                     <a href="#" id="createnetwork"  target="_blank" title="please select cnkb interactions to create network">Create Network</a>   				 
                     <br/>
			         <small><font color="grey">Confidence threshold: </font></small>
                     <small id="throttle-input"><font color="grey">e.g. 0.01 </font></small>	
				   	 <div id="createnw_progress_indicator" align="center" style="display: none;">data is loading ......
                         <img id="cnkb_data_progress_indicator" src="img/progress_indicator.gif" width="20" height="20" alt="Please wait ......"><br>
                     </div>
                  </div>
                  <br/>	
             </div>
      </script>

    <script type="text/template" id="cnkb-result-row-tmpl">
        <tr id="tr_{{geneName}}">
            <td><input type="checkbox" id="checkbox_{{geneName}}" value="{{geneName}}" class="cnkb_checkbox"></td> 
		    <td>{{geneName}}</td>; 
        </tr>
      </script>

    <script type="text/template" id="cnkb-cytoscape-tmpl">
        <div class="cytoscape-container">
        <div id="cnkb_cytoscape_progress">
            <img id="cnkb_cytoscape_progress_indicator" class="centeredImage" src="img/progress_indicator.gif" width="30" height="30" alt="Please wait ......">
        </div>
        <div id="cytoscape">
        </div>
        <div id="cnkb-cytoscape-legend" class="well cytoscape-legend">
            <svg  width="500" height="30"xmlns="http://www.w3.org/2000/svg">
               {{svgHtml}}
            </svg>
            <br/>
            {{description}}  
        </div>
        </div>
      </script>

    <script type="text/template" id="gene-cart-help-tmpl">
        <div class="container common-container" id="cnkbhelp-container" >
            <div class=row>
               <div class="col-10">
                    <h3>Gene Cart Help</h3>
                    <p>The Gene Cart allows users to build a list of genes and query the Cellular Networks Knowledge Base (CNKB) for molecular interactions involving these genes.  The CNKB is a repository of molecular interactions networks. It contains computationally-derived networks obtained by applying state of the art Systems and Structure Biology algorithms from the laboratories of Drs. Andrea Califano and Barry Honig at Columbia University. A detailed <a target="_blank" href="http://wiki.c2b2.columbia.edu/workbench/index.php/Cellular_Networks_KnowledgeBase">description of the CNKB</a> is available which also describes how the CNKB can be accessed from within the software platform <a target="_blank" href="http://www.geworkbench.org">geWorkbench</a>.</p>
                    <p>In the Observations for a particular HIPC study, those entries that are genes will have a green "+" sign to right of the gene symbol. Clicking this "+" sign will add the gene to the Gene Cart. The Gene Cart is limited to 25 genes.</p>
                    <p>In the Gene Cart, clicking on "Find Interactions in Networks (CNKB)" will bring the user to the Cellular Networks Knowledge Base page where a particular interactome and version can be chosen. Descriptive text for each is available by selecting any particular interactome or version. Clicking "Submit" will initiate a query of the CNKB using the genes in the cart.  "Version" may represent different types of interactions inferred on a given dataset.  See the description of each version for details.</p>
                    <p>The query result is displayed in a table showing the number and type of interactions found for each query gene. A check box to the left of each gene allows individual results to be selected. The interactions for selected genes can then be downloaded in the form of a Cytoscape "SIF"-format file, or displayed directly in Cytoscape.js in the browser. The number of interactions to display is controlled using the "Interactions Limit" pulldown. Interactions to display are then chosen based on a ranking by a measure of likelihood, e.g. the top 100 interactions.</p>
                    <p>Several layout options are available for Cytoscape and can be selected using the "Layout" pulldown.</p>
                    <p>In Cytoscape.js, several common interaction types have been assigned specific colors used for the lines representing them, and these will be shown on the legend of the graph.  The genes used in the CNKB query (hub genes) will be highlighted in yellow.</p>
                </div>
                <div class="col-1">
                   <a href="javascript:history.back()">Back</a>
                </div>
            </div>
         </div>
     </script>

    <script type="text/template" id="gene-cart-option-tmpl">
        <option value="{{displayItem}}">{{displayItem}}</option>
     </script>

    <script type="text/template" id="gene-cart-option-tmpl-preselected">
        <option value="{{displayItem}}" selected>{{displayItem}}</option>
     </script>

    <script type="text/template" id="help-navigate-tmpl">
        <div class="help-navigate-text-container">
            <h3>Navigating and Understanding Dashboard Content</h3>
            <p>
                The HIPC aims to increase understanding of the underlying molecular causes of distinct cancer types and accelerate development of clinically useful biomarkers and targeted therapies for precision medicine.
                The Dashboard is one tool that provides access to Network findings.
                Results are available as bulk datasets, data-related figures, and are formatted to enable navigation and comprehension by most researchers, from computational experts to those with little bioinformatics dexterity.
                Through the Dashboard, the <b>HIPC</b> gives the research community a method to interrogate experimental observations across the Centers.
                Before using the Dashboard, read the following to learn how Dashboard content is organized.
            </p>

            <ul>
                <li><i>Center</i>: One of the academic research teams that make up the HIPC.</li>

                <li><i>Study</i>: A Dashboard entry that represents a dataset associated with positive experimental results, a set of data-related figures, or a polished story.</li>

                <li><i>Subject</i>: The focus of an experiment or result in a Dashboard <b>study</b> (<i>e.g.</i>, genes, proteins, small molecules, cell lines, animal models).</li>
                <ul>
                    <li>Class</i>: A set of objects representing the same molecular or biological category (DNA, RNA, protein, small molecule, tissue, animal model) and sharing a set of required and optional attributes.</li>
                    <li><i>Role</i>: The <b>Center</b>-designated function of a gene, protein, or compound based on their interpretation of observations within a particular experimental or computational context. Assigning <b>role</b>s from a restricted list of terms (biomarkers, diseases, master regulators, interactors, oncogenes, perturbagens, candidate drugs, or targets) helps organize subjects in Dashboard for browsing and searching.
                </ul>

                <li><i>Evidence</i>: Selected positive or validated results from a scientific experiment (<i>e.g.</i>, numeric values, text labels, data figures).</li>
                <ul>
                    <li><i>Type</i>:  Category of evidence provided in support of the results. Examples include the following: literature, measured, link, reference, background, observed, computed, written, resources, species.
                </ul>

                <li><i>Observation</i>: A <b>Center</b>-determined conclusion that is submitted as a connection between <b>subjects</b> and <b>evidence</b>; the "fundamental unit" of the Dashboard.</li>
            </ul>

            <h3>Dashboard Organization</h3>
            <p>
                During the submission process, <b>subjects</b> from HIPC studies are ordered by relevance based on the number of <b>observations</b> associated with a <b>study</b>, the <b>Tiers</b> of these <b>observations</b>, and the number of different <b>Centers</b> providing <b>observations</b> about that particular <b>subject</b>.
            </p>
        </div>
    </script>

    <script id="tbl-project-title-tmpl" type="text/template">
        <tr class="group"><td colspan="5"><a href="&#35;{{centerStableURL}}/{{project}}">Signature Type: {{project}}</a></td></tr>
    </script>

    <!-- end of templates -->

    <script src="js/datatables.min.js"></script>
    <script src="js/paging.js"></script>
    <script src="js/underscore-min.js"></script>
    <script src="js/backbone-min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>
    <script src="js/jquery.fancybox.min.js"></script>
    <script src="js/jquery.expander.min.js"></script>
    <script src="js/cytoscape.min.js"></script>
    <script src="js/cola.min.js"></script>
    <script src="js/cytoscape-cola.js"></script>
    <script src="js/encoder.js"></script>
    <script src="js/jquery.contextMenu.min.js"></script>
    <script src="js/jquery.ui.position.min.js"></script>
    <script src="js/hipc-subject-images.js"></script>
    <script src="js/cnkb.js"></script>
    <script src="js/hipc-signature.js"></script>

</body>

</html>