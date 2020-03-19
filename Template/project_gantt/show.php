<section id="main">
<div style="display: flow-root;">
    <div class="page-header" style="float:left;">
        <ul>
            <?php if ($this->user->hasAccess('ProjectCreationController', 'create')): ?>
                <li>
                    <?=$this->modal->medium('plus', t('New project'), 'ProjectCreationController', 'create')?>
                </li>
            <?php endif?>
            <?php if ($this->app->config('disable_private_project', 0) == 0): ?>
                <li>
                    <?=$this->modal->medium('lock', t('New private project'), 'ProjectCreationController', 'createPrivate')?>
                </li>
            <?php endif?>
            <li>
                <?=$this->url->icon('folder', t('Projects list'), 'ProjectListController', 'show')?>
            </li>
            <?php if ($this->user->hasAccess('ProjectUserOverviewController', 'managers')): ?>
                <li>
                    <?=$this->url->icon('user', t('Users overview'), 'ProjectUserOverviewController', 'managers')?>
                </li>
            <?php endif?>
        </ul>
    </div>
    <div class="project-header" style="float:left; width:600px;">
        <div class="filter-box-component">
            <div class="filter-box">
                <form method="get" action="/" class="search">
                <input type="hidden" name="controller" id="form-controller" value="ProjectGanttController"/>
                <input type="hidden" name="action" id="form-action" value="show"/>
                <input type="hidden" name="plugin" id="form-plugin" value="Gantt"/>
                <!-- <input type="hidden" name="project_id" id="form-project_id" value="1"/> -->
                    <div class="input-addon">
                        <input type="text" name="search" id="form-search" value='<?=$this->ganttHelper->getSearch()?>' class="input-addon-field" placeholder="过滤器">
                        <div class="input-addon-item">
                            <div class="dropdown">
                                <a href="#" class="dropdown-menu dropdown-menu-link-icon" title="默认过滤器">
                                    <i class="fa fa-filter fa-fw"></i>
                                    <i class="fa fa-caret-down"></i>
                                </a>
                                <ul>
                                    <li><a href="#" class="filter-helper filter-reset" data-filter="status:open" title="快捷键: &quot;r&quot;">重置过滤器</a></li>
                                    <li><a href="#" class="filter-helper" data-filter="status:open assignee:me">我的任务</a></li>
                                    <li><a href="#" class="filter-helper" data-filter="status:open assignee:me due:tomorrow">我的明天到期的任务</a></li>
                                    <li><a href="#" class="filter-helper" data-filter="status:open due:today">今天到期的任务</a></li>
                                    <li><a href="#" class="filter-helper" data-filter="status:open due:tomorrow">明天到期的任务</a></li>
                                    <li><a href="#" class="filter-helper" data-filter="status:open due:yesterday">昨天到期的任务</a></li>
                                    <li><a href="#" class="filter-helper" data-filter="status:closed">已关闭任务</a></li>
                                    <li><a href="#" class="filter-helper" data-filter="status:open">打开的任务</a></li>
                                    <li><a href="#" class="filter-helper" data-filter="status:open assignee:nobody">未指派</a></li>
                                    <li><a href="#" class="filter-helper" data-filter="status:open assignee:anybody">Assigned</a></li>
                                    <li><a href="#" class="filter-helper" data-filter="status:open category:none">无分类</a></li>
                                    <li><a href="https://docs.kanboard.org/en/1.2.13/user_guide/search.html" target="_blank">查看高级搜索语法</a>        </li>
                                </ul>
                            </div>
                        </div>
                        <!-- <div class="input-addon-item">
                            <div class="dropdown">
                                <a href="#" class="dropdown-menu dropdown-menu-link-icon" title="用户过滤器">
                                <i class="fa fa-user fa-fw"></i>
                                <i class="fa fa-caret-down"></i>
                                </a>
                                <ul>
                                    <li><a href="#" class="filter-helper" data-unique-filter="assignee:nobody">未指派</a></li>
                                    <li><a href="#" class="filter-helper" data-unique-filter="assignee:anybody">Assigned</a></li>
                                </ul>
                            </div>
                        </div> -->
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

    <section class='float-left'>
        <?php if (empty($projects)): ?>
            <p class="alert"><?=t('No project')?></p>
        <?php else: ?>
            <div
                id="gantt-chart"
                data-search='<?=$this->ganttHelper->getSearch()?>'
                data-records='<?=json_encode($projects, JSON_HEX_APOS)?>'
                data-save-url="<?=$this->url->href('ProjectGanttController', 'save', array('plugin' => 'Gantt'))?>"
                data-save-task-url="<?=$this->url->href('TaskGanttController', 'save', array('plugin' => 'Gantt'))?>"
                data-label-project-manager="<?=t('Project managers')?>"
                data-label-project-member="<?=t('Project members')?>"
                data-label-gantt-link="<?=t('Gantt chart for this project')?>"
                data-label-board-link="<?=t('Project board')?>"
                data-label-start-date="<?=t('Start date:')?>"
                data-label-end-date="<?=t('End date:')?>"
                data-label-not-defined="<?=t('There is no start date or end date for this project.')?>"
            ></div>
        <?php endif?>
    </section>
</section>
