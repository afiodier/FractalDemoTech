FROM golang:1.22 AS build
WORKDIR /app
COPY . .
RUN go build -o /usr/local/bin/fractal-worker

FROM gcr.io/distroless/base-debian11
COPY --from=build /usr/local/bin/fractal-worker /usr/local/bin/fractal-worker
EXPOSE 6001
ENTRYPOINT ["/usr/local/bin/fractal-worker"]