#!/bin/bash
set -e

CONNECT_URL="https://saucelabs.com/downloads/sc-4.3.11-linux.tar.gz"
CONNECT_DOWNLOAD="sc-4.3.11-linux"
CONNECT_DOWNLOAD_FILE=$CONNECT_DOWNLOAD.tar.gz
CONNECT_DIR=".sauce-connect"
CONNECT_LOG="log"
BUILD_REMOTE_LOG="https://build-logs.firebaseio.com/builds.json"
GRUNT="$NODE_HOME/node node_modules/grunt-cli/bin/grunt"
SC_EXE="./sc"
SAUCE_READY_FILE="./sauce-connect-ready"
SAUCE_READY_FILE_2="./sauce-connect-ready-2"

NORM=""
TEXTCOLOR=""

#build_number, port, ready file
function startTunnel {
	echo "Starting Sauce Connect in the background (tunnel $1)"
	echo "Logging into $CONNECT_LOG"
	$SC_EXE --readyfile $3 \
	    --tunnel-identifier $1 \
	    --user $SAUCE_USERNAME \
	    --api-key $SAUCE_ACCESS_KEY \
	    --logfile $CONNECT_LOG \
	    --se-port $2 \
	    --tunnel-domains localhost &

}

function startOneTunnel {

	startTunnel $BUILD_NUMBER 4445 $SAUCE_READY_FILE

    while [ ! -f $SAUCE_READY_FILE ]; do
	  echo "Waiting for Sauce Labs..."
	  sleep 5
	done

	cd ..

}

function startTwoTunnels {

	SECOND_BUILD_NUMBER="$BUILD_NUMBER""2"

	startTunnel $BUILD_NUMBER 4445 $SAUCE_READY_FILE
	startTunnel $SECOND_BUILD_NUMBER 4446 $SAUCE_READY_FILE_2

	while [ ! -f $SAUCE_READY_FILE ] && [ ! -f $SAUCE_READY_FILE_2 ]; do
	  echo "Waiting for Sauce Labs..."
	  sleep 5
	done

	cd ..

}

# start_time, elapsed time
function printCompleteCommand {
	END_DATE=$(date '+%x_%H:%M:%S:%N')
	curl -X POST -d '{"status": "success", "startTime": "'"$1"'", "endTime": "'"$END_DATE"'", "buildName": "'"$MODULE_NAME"'", "buildMode": "'"$BUILD_MODE"'", "totalDuration": "'"$(($2/60)) min $(($2%60)) sec"'"}' $BUILD_REMOTE_LOG
}

function printFailedCommand {
	END_DATE=$(date '+%x_%H:%M:%S:%N')
	curl -X POST -d '{"status": "fail", "endTime": "'"$END_DATE"'", "buildName": "'"$MODULE_NAME"'", "buildMode": "'"$BUILD_MODE"'"}' $BUILD_REMOTE_LOG
}

function regular_mode {
	# regular mode
	startOneTunnel

	START_DATE=$(date '+%x_%H:%M:%S:%N')
	START_TIME=$SECONDS
	$GRUNT test:ci & pid1=$!
	wait $pid1 || RUN_RESULT_STATUS=1
}

function seperate_server_and_tunnel {
	# two processes on separate tunnel and server
	startTwoTunnels

	START_DATE=$(date '+%x_%H:%M:%S:%N')
	START_TIME=$SECONDS
	$GRUNT test:ci_parallel_main_server & pid1=$!
	$GRUNT test:ci_parallel_diff_server_diff_tunnel & pid2=$!
	wait $pid1 || RUN_RESULT_STATUS=1
	wait $pid2 || RUN_RESULT_STATUS=1
}

function same_server_and_tunnel {
	# two processes on same tunnel and server
	startOneTunnel

	START_DATE=$(date '+%x_%H:%M:%S:%N')
	START_TIME=$SECONDS
	$GRUNT test:ci_parallel_main_server & pid1=$!
	$GRUNT test:ci_parallel_same_server_tunnel & pid2=$!
	wait $pid1 || RUN_RESULT_STATUS=1
	wait $pid2 || RUN_RESULT_STATUS=1
}

function seperate_server_same_tunnel {
	# two processes on same tunnel and separate server
	startOneTunnel

	START_TIME=$SECONDS
	START_DATE=$(date '+%x_%H:%M:%S:%N')
	$GRUNT test:ci_parallel_main_server & pid1=$!
	$GRUNT test:ci_parallel_same_tunnel & pid2=$!
	wait $pid1 || RUN_RESULT_STATUS=1
	wait $pid2 || RUN_RESULT_STATUS=1
}

function same_server_seperate_tunnel {
	# two processes on same server and separate tunnel
	startTwoTunnels

	START_TIME=$SECONDS
	START_DATE=$(date '+%x_%H:%M:%S:%N')
	$GRUNT test:ci_parallel_main_server & pid1=$!
	$GRUNT test:ci_parallel_same_server & pid2=$!
	wait $pid1 || RUN_RESULT_STATUS=1
	wait $pid2 || RUN_RESULT_STATUS=1
}

#to run locally define export LOCAL_MODE=1 (change path to sc if needed)
if [[ $LOCAL_MODE = 1 ]]; then
    GRUNT="grunt"
    CONNECT_URL="https://saucelabs.com/downloads/sc-4.3.11-osx.zip"
    CONNECT_DOWNLOAD="sc-4.3.11-osx"
    CONNECT_DOWNLOAD_FILE=$CONNECT_DOWNLOAD.zip
    BUILD_REMOTE_LOG="https://build-logs.firebaseio.com/local-builds.json"
fi

mkdir -p $CONNECT_DIR

cd $CONNECT_DIR

echo "Downloading Sauce Connect..."
if [[ ! -f ./$CONNECT_DOWNLOAD ]]; then
   curl $CONNECT_URL > $CONNECT_DOWNLOAD_FILE 2> /dev/null
fi
tar -zxvf $CONNECT_DOWNLOAD_FILE
cp $CONNECT_DOWNLOAD/bin/sc ./sc
rm -rf $CONNECT_DOWNLOAD
rm -f sauce-connect-ready

TYPE=$((RANDOM%2));
echo "type is ${TYPE}"
if [[ $TYPE = 1 ]]; then
	echo echo "${TEXTCOLOR}Running regular_mode${NORM}"
	BUILD_MODE="regular_mode"
	regular_mode
else
	echo echo "${TEXTCOLOR}Running seperate_server_and_tunnel${NORM}"
	BUILD_MODE="seperate_server_and_tunnel"
	seperate_server_and_tunnel
fi

if [[ $RUN_RESULT_STATUS = 1 ]]; then
	printFailedCommand
else
	ELAPSED_TIME=$(($SECONDS - $START_TIME))
	echo "${TEXTCOLOR}***** Done $BUILD_MODE${NORM}"
	echo "${TEXTCOLOR}$(($ELAPSED_TIME/60)) min $(($ELAPSED_TIME%60)) sec ${NORM}"
	printCompleteCommand $START_DATE $ELAPSED_TIME
fi
