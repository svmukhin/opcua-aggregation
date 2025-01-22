using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using OpcuaAggregationClient.Infrastructure.Entities;

namespace OpcuaAggregationClient.Controllers;

[ApiController]
[Route("/api/aggregation/tags")]
public class OpcuaAggregationController : ControllerBase
{
    [HttpGet]
    public IActionResult GetAggregationTags([FromQuery] string sessionName, [FromQuery] IEnumerable<string> tagids, [FromServices] IMemoryCache memoryCache)
    {
        var Data = new List<object>();
        var connectError = memoryCache.Get<AggregationTag>($"{sessionName}.connectError");
        int sessionStatusCode;
        if (connectError is null)
        {
            sessionStatusCode = 1;
        }
        else
        {
            sessionStatusCode = (int)connectError.Value;
        }


        foreach (var tagid in tagids)
        {
            if (memoryCache.TryGetValue(tagid, out AggregationTag? aggregationTag))
            {
                if (aggregationTag is null)
                    continue;

                var statusCode = sessionStatusCode == 1 && tagid != $"{sessionName}.connectError" ? 1 : aggregationTag.StatusCode;

                Data.Add(new { tagid, aggregationTag.Value, statusCode, aggregationTag.Timestamp });
            }
        }

        return new JsonResult(new { Data });
    }
}