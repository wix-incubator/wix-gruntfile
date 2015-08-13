#!/bin/bash
set -e

CONNECT_URL="https://saucelabs.com/downloads/sc-4.3.9-linux.tar.gz"
CONNECT_DOWNLOAD="sc-4.3.9-linux"
CONNECT_DOWNLOAD_FILE=$CONNECT_DOWNLOAD.tar.gz
CONNECT_DIR=".sauce-connect"
CONNECT_LOG="log"
BUILD_REMOTE_LOG="https://build-logs.firebaseio.com/builds.json"
GRUNT="$NODE_HOME/node node_modules/grunt-cli/bin/grunt"
SC_EXE="./sc"

NORM=""
TEXTCOLOR=""

#build_number, port
function startTunnel {
	echo "Starting Sauce Connect in the background (tunnel $1)"
	echo "Logging into $CONNECT_LOG"
	$SC_EXE --readyfile ./sauce-connect-ready \
	    --tunnel-identifier $1 \
	    --user $SAUCE_USERNAME \
	    --api-key $SAUCE_ACCESS_KEY \
	    --logfile $CONNECT_LOG \
	    --se-port $2 \
	    --tunnel-domains localhost &

}

function startOneTunnel {

	startTunnel $BUILD_NUMBER 4445

    while [ ! -f ./sauce-connect-ready ]; do
	  echo "Waiting for Sauce Labs..."
	  sleep 5
	done

	cd ..

}

function startTwoTunnels {

	SECOND_BUILD_NUMBER="$BUILD_NUMBER""2"

	startTunnel $BUILD_NUMBER 4445
	startTunnel $SECOND_BUILD_NUMBER 4446

	while [ ! -f ./sauce-connect-ready ] && [ ! -f ./sauce-connect-ready-2 ]; do
	  echo "Waiting for Sauce Labs..."
	  sleep 5
	done

	cd ..

}

# start_time, elapsed time
function printCompleteCommand {
	END_DATE=$(date '+%x_%H:%M:%S:%N')
	curl -X POST -d '{"startTime": "'"$1"'", "endTime": "'"$END_DATE"'", "buildName": "scheduler-client", "buildMode": "'"$BUILD_MODE"'", "totalDuration": "'"$(($2/60)) min $(($2%60)) sec"'"}' $BUILD_REMOTE_LOG
}

function regular_mode {
	# regular mode
	startOneTunnel

	START_DATE=$(date '+%x_%H:%M:%S:%N')
	START_TIME=$SECONDS
	$GRUNT test:ci
	ELAPSED_TIME=$(($SECONDS - $START_TIME))
	echo "${TEXTCOLOR}***** Done 1: regular mode:${NORM}"
	echo "${TEXTCOLOR}$(($ELAPSED_TIME/60)) min $(($ELAPSED_TIME%60)) sec ${NORM}"
	printCompleteCommand $START_DATE $ELAPSED_TIME
}

function seperate_server_and_tunnel {
	# two processes on separate tunnel and server
	startTwoTunnels

	START_DATE=$(date '+%x_%H:%M:%S:%N')
	START_TIME=$SECONDS
	$GRUNT test:ci_parallel_main_server & pid1=$!
	$GRUNT test:ci_parallel_diff_server_diff_tunnel & pid2=$!
	wait $pid1
	wait $pid2
	ELAPSED_TIME=$(($SECONDS - $START_TIME))
	echo "${TEXTCOLOR}Done 2: separate server and tunnel${NORM}"
	echo "${TEXTCOLOR}$(($ELAPSED_TIME/60)) min $(($ELAPSED_TIME%60)) sec ${NORM}"
	printCompleteCommand $START_DATE $ELAPSED_TIME
}

function same_server_and_tunnel {
	# two processes on same tunnel and server
	startOneTunnel

	START_DATE=$(date '+%x_%H:%M:%S:%N')
	START_TIME=$SECONDS
	$GRUNT test:ci_parallel_main_server & pid1=$!
	$GRUNT test:ci_parallel_same_server_tunnel & pid2=$!
	wait $pid1
	wait $pid2
	ELAPSED_TIME=$(($SECONDS - $START_TIME))
	echo "${TEXTCOLOR}***** Done 3: same server and tunnel${NORM}"
	echo "${TEXTCOLOR}$(($ELAPSED_TIME/60)) min $(($ELAPSED_TIME%60)) sec ${NORM}"
	printCompleteCommand $START_DATE $ELAPSED_TIME
}

function seperate_server_same_tunnel {
	# two processes on same tunnel and separate server
	startOneTunnel

	START_TIME=$SECONDS
	START_DATE=$(date '+%x_%H:%M:%S:%N')
	$GRUNT test:ci_parallel_main_server & pid1=$!
	$GRUNT test:ci_parallel_same_tunnel & pid2=$!
	wait $pid1
	wait $pid2
	ELAPSED_TIME=$(($SECONDS - $START_TIME))
	echo "${TEXTCOLOR}***** Done 4: same tunnel${NORM}"
	echo "${TEXTCOLOR}$(($ELAPSED_TIME/60)) min $(($ELAPSED_TIME%60)) sec ${NORM}"
	printCompleteCommand $START_DATE $ELAPSED_TIME
}

function same_server_seperate_tunnel {
	# two processes on same server and separate tunnel
	startTwoTunnels

	START_TIME=$SECONDS
	START_DATE=$(date '+%x_%H:%M:%S:%N')
	$GRUNT test:ci_parallel_main_server & pid1=$!
	$GRUNT test:ci_parallel_same_server & pid2=$!
	wait $pid1
	wait $pid2
	ELAPSED_TIME=$(($SECONDS - $START_TIME))
	echo "${TEXTCOLOR}***** Done 5: same server${NORM}"
	echo "${TEXTCOLOR}$(($ELAPSED_TIME/60)) min $(($ELAPSED_TIME%60)) sec ${NORM}"
	printCompleteCommand $START_DATE $ELAPSED_TIME
}

#to run locally define export LOCAL_MODE=1 (change path to sc if needed)
if [[ $LOCAL_MODE = 1 ]]; then
	# SC_EXE="/Applications/sc-4.3.8-osx/bin/sc"
    GRUNT="grunt"
    CONNECT_URL="https://saucelabs.com/downloads/sc-4.3.10-osx.zip"
    CONNECT_DOWNLOAD="sc-4.3.10-osx"
    CONNECT_DOWNLOAD_FILE=$CONNECT_DOWNLOAD.zip
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
