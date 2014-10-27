#!/usr/bin/env php
<?php

set_time_limit(0);

require_once __DIR__ ."/app.php";

$console = $app["console"];
$console->add(new \Spika\Console\UserBatchConsole);
$console->run();