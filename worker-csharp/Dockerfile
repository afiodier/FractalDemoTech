# worker-csharp/Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy project file(s) first so that Docker can cache the restore step
COPY worker-csharp/worker-csharp.csproj ./
RUN dotnet restore

# Copy source code and build
COPY worker-csharp/. .
RUN dotnet publish -c Release -o out

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/out ./
EXPOSE 6003
ENTRYPOINT ["dotnet", "worker-csharp.dll"]