FROM golang:1.25.1 AS build
WORKDIR /app
COPY . .
RUN go build -o /usr/local/bin/fractal-worker ./src/main.go

FROM gcr.io/distroless/base-debian12
COPY --from=build /usr/local/bin/fractal-worker /usr/local/bin/fractal-worker
EXPOSE 6001
ENTRYPOINT ["/usr/local/bin/fractal-worker"]