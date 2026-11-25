FROM px4io/px4-sitl-gazebo:v1.18.0-rc2

# Dedicated GCS and WELFARE-AI telemetry outputs.
RUN set -eu; \
    f=/opt/px4-gazebo/etc/init.d-posix/px4-rc.mavlink; \
    grep -F 'mavlink start -x -u $udp_gcs_port_local -r 4000000 -f $mavlink_network_interface_arg' "$f"; \
    sed -i 's|mavlink start -x -u \$udp_gcs_port_local -r 4000000 -f|mavlink start -x -u $udp_gcs_port_local -o 14560 -r 4000000 -f|' "$f"; \
    awk '\
        /# API\/Offboard link/ && !inserted { \
            print ""; \
            print "# WELFARE-AI Go Bridge telemetry link"; \
            print "mavlink start -x -u 18571 -o 14610 -r 4000000 -f $mavlink_network_interface_arg"; \
            print "mavlink stream -r 50 -s GLOBAL_POSITION_INT -u 18571"; \
            print "mavlink stream -r 50 -s ATTITUDE -u 18571"; \
            print "mavlink stream -r 10 -s GPS_RAW_INT -u 18571"; \
            print "mavlink stream -r 10 -s VFR_HUD -u 18571"; \
            print ""; \
            inserted=1; \
        } \
        { print } \
        END { if (!inserted) exit 1 } \
    ' "$f" > "$f.welfare-ai.tmp"; \
    mv "$f.welfare-ai.tmp" "$f"; \
    grep -F ' -o 14560 ' "$f"; \
    grep -F ' -u 18571 -o 14610 ' "$f"; \
    grep -F ' -s GLOBAL_POSITION_INT -u 18571' "$f"; \
    grep -F ' -s ATTITUDE -u 18571' "$f"; \
    grep -F ' -s GPS_RAW_INT -u 18571' "$f"; \
    grep -F ' -s VFR_HUD -u 18571' "$f"

ENTRYPOINT ["/opt/px4-gazebo/bin/px4-entrypoint.sh"]
CMD ["-d", "-w", "/opt/px4-gazebo", "/opt/px4-gazebo"]
