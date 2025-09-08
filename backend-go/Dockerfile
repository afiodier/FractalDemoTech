FROM golang:1.25.1 AS build
WORKDIR /app
COPY . .
RUN go build -o /usr/local/bin/fractal-api ./src/main.go

FROM gcr.io/distroless/base-debian12
COPY --from=build /usr/local/bin/fractal-api /usr/local/bin/fractal-api
EXPOSE 5001
ENTRYPOINT ["/usr/local/bin/fractal-api"]