export LOCAL_MODE=1

node_modules/wix-gruntfile/scripts/parallel_ci.sh

killall sc
sleep 15

export LOCAL_MODE=0
