<?php

namespace Kanboard\Plugin\Gantt\Helper;

use Kanboard\Core\Base;

class GanttHelper extends Base
{
    public function getSearch()
    {
        return urldecode($this->request->getStringParam('search','status:open'));
    }
}
?>