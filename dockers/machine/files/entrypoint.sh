cd ${PROJECT_ROOT}/pennai/machine
rm -f ${PROJECT_ROOT}/pennai/machine/specs.json
#/etc/init.d/ssh start
#ifconfig eth0
export IP=`wget -qO- http://instance-data/latest/meta-data/local-ipv4`
export MACHINE_URL=http://${IP}:${MACHINE_PORT}
node machine.js
