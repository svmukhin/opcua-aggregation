mkdir -p .assets/OpcuaAggregatioinClient
rm -rf .assets/OpcuaAggregatioinClient/*
dotnet publish src/OpcuaAggregatioinClient/OpcuaAggregationClient.sln -c Release -r linux-x64
cp src/OpcuaAggregatioinClient/.artifacts/publish/* .assets/OpcuaAggregatioinClient/ -r
mkdir -p .assets/OpcuaAggregatioinClient/wwwroot
cp src/opcua-aggregation-wwwroot/wwwroot/* .assets/OpcuaAggregatioinClient/wwwroot/ -r