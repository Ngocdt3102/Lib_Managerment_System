# Multi-stage build cho Backend ASP.NET Core Web API
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy file csproj và restore dependencies
COPY LibManagementSystem.API.csproj ./
RUN dotnet restore

# Copy toàn bộ mã nguồn và build Release
COPY . ./
RUN dotnet publish -c Release -o /app/publish

# Runtime image phục vụ chạy sản phẩm
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "LibManagementSystem.API.dll"]
