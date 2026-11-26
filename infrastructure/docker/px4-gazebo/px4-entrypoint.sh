#!/bin/sh
set -eu

if [ -d /opt/px4-gazebo ]; then
    PX4_PREFIX=/opt/px4-gazebo
else
    PX4_PREFIX=/opt/px4
fi

DOCKER_HOST_IP=$(getent ahostsv4 host.docker.internal 2>/dev/null |
    awk '/STREAM/ {print $1; exit}')

if [ -n "$DOCKER_HOST_IP" ]; then
    MAVLINK_FILE="$PX4_PREFIX/etc/init.d-posix/px4-rc.mavlink"

    # Only redirect the dedicated WELFARE-AI telemetry link.
    OLD='mavlink start -x -u 18571 -o 14610'
    NEW="mavlink start -x -t $DOCKER_HOST_IP -u 18571 -o 14610"

    grep -F "$OLD" "$MAVLINK_FILE" >/dev/null
    sed -i "s|$OLD|$NEW|" "$MAVLINK_FILE"
    grep -F "$NEW" "$MAVLINK_FILE" >/dev/null

    # Preserve the original Docker Desktop DDS host routing.
    sed -i "s|uxrce_dds_client start -t udp|uxrce_dds_client start -t udp -h $DOCKER_HOST_IP|" \
        "$PX4_PREFIX/etc/init.d-posix/rcS"

    echo "WELFARE-AI telemetry target: $DOCKER_HOST_IP:14610"
else
    echo "WARNING: host.docker.internal IPv4 not found; telemetry target unchanged."
fi

exec "$PX4_PREFIX/bin/px4" "$@"
