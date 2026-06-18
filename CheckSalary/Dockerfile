FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY CheckSalary/CheckSalary.csproj CheckSalary/
COPY CheckSalary.Domain/CheckSalary.Domain.csproj CheckSalary.Domain/
COPY CheckSalary.Application/CheckSalary.Application.csproj CheckSalary.Application/
COPY CheckSalary.Infrastructure/CheckSalary.Infrastructure.csproj CheckSalary.Infrastructure/

RUN dotnet restore CheckSalary/CheckSalary.csproj

COPY . .

WORKDIR /src/CheckSalary
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
EXPOSE 5067
ENV ASPNETCORE_URLS=http://+:5067
ENTRYPOINT ["dotnet", "CheckSalary.dll"]