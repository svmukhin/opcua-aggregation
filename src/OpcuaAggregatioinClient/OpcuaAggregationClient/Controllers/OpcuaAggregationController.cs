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
        var Data = new Dictionary<string, AggregationTag?>();

        foreach (var tagid in tagids)
        {
            if(memoryCache.TryGetValue(tagid, out AggregationTag? aggregationTag))
            {
                Data.Add(tagid, aggregationTag);
            }
        }

        return new JsonResult(new { Data = Data });
    }
}