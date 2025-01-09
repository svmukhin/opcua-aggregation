mkdir -p .archives/OpcuaAggregatioinClient
rm -f .archives/OpcuaAggregatioinClient/*
dotnet publish src/OpcuaAggregatioinClient/OpcuaAggregationClient/OpcuaAggregationClient.csproj -c release -r linux-x64 -o .archives/OpcuaAggregatioinClient