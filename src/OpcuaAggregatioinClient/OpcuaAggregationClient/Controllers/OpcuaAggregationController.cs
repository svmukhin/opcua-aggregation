using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using OpcuaAggregationClient.Infrastructure.Entities;

namespace OpcuaAggregationClient.Controllers;

[ApiController]
[Route("/api/aggregation/tags")]
public class OpcuaAggregationController: ControllerBase
{
    [HttpGet]
    public IActionResult GetAggregationTags([FromQuery]IEnumerable<string> tagids, [FromServices] IMemoryCache memoryCache)
    {
        var Data = new List<object>();

        foreach (var tagid in tagids)
        {
            if(memoryCache.TryGetValue(tagid, out AggregationTag? aggregationTag))
            {
                if(aggregationTag is null)
                    continue;

                Data.Add( new { tagid, aggregationTag.Value, aggregationTag.StatusCode, aggregationTag.Timestamp });
            }
        }

        return new JsonResult(new { Data = Data });
    }
}