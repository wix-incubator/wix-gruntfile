export LOCAL_MODE=1
export MODULE_NAME=$USER

node_modules/wix-gruntfile/scripts/parallel_ci.sh

killall sc
sleep 15

export LOCAL_MODE=0
