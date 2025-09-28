FROM postgres:15-alpine

# Install AWS CLI for S3 uploads
RUN apk add --no-cache \
    python3 \
    py3-pip \
    && pip3 install --no-cache-dir awscli

# Copy backup script
COPY backup.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/backup.sh

# Run backup script
CMD ["/usr/local/bin/backup.sh"]