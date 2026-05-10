FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY . .
WORKDIR /src/src/HenriTrips.Api

RUN dotnet restore
#RUN dotnet publish -c Release -o /app/out		#release code
RUN dotnet publish -c Debug -o /app/out			#debug code


FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/out .

EXPOSE 8080

ENTRYPOINT ["dotnet", "HenriTrips.Api.dll"]
