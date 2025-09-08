FROM golang:1.22 AS build
WORKDIR /app
COPY . .
RUN go build -o /usr/local/bin/fractal-api

FROM gcr.io/distroless/base-debian11
COPY --from=build /usr/local/bin/fractal-api /usr/local/bin/fractal-api
EXPOSE 5001
ENTRYPOINT ["/usr/local/bin/fractal-api"]