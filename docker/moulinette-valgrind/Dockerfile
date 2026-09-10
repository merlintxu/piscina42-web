FROM gcc:15

RUN apt-get update \
    && apt-get install -y --no-install-recommends valgrind=1:3.24.0-3 \
    && rm -rf /var/lib/apt/lists/*

USER 65534:65534
