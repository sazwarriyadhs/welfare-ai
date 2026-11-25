FROM welfare-ai/px4-sitl:pre-telemetry-backup

RUN sed -i 's|mavlink start -x -u \$udp_gcs_port_local -r|mavlink start -x -u $udp_gcs_port_local -o 14610 -r|' \
    /opt/px4/etc/init.d-posix/px4-rc.mavlink

ENTRYPOINT ["/opt/px4/bin/px4-entrypoint.sh"]
CMD ["-d", "-w", "/opt/px4", "/opt/px4"]
