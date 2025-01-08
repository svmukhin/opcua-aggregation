using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace OpcuaAggregationClient.Controllers;

[ApiController]
[Route("/api/opcua/session")]
public class OpcuaAggregationController: ControllerBase
{
    [HttpGet("{id}")]
    public async Task<IActionResult> GetSessionValues([FromRoute] int id)
    {
        var result = new {
            Session = new {
                Id = id,
                Data = new Dictionary<string, OpcTag> { 
                    { "p5g257.ns=4;MAIN.group.kl3122.ai.ai[1]", new OpcTag(0.21, DateTime.Now)},
                    { "p5g257.ns=4;MAIN.group.kl3122.ai.ai[2]", new OpcTag(0.15, DateTime.Now)},
                    { "p5g257.ns=4;MAIN.group.kl3122.ai.ai[3]", new OpcTag(10, DateTime.Now) },
                    { "p5g257.ns=4;MAIN.group.kl3122.ai.ai[4]", new OpcTag(0, DateTime.Now)},
                    { "p5g257.ns=4;MAIN.group.kl1408.di.di[1]", new OpcTag(false, DateTime.Now)},
                    { "p5g257.ns=4;MAIN.group.kl1408.di.di[2]", new OpcTag(true, DateTime.Now)},
                }
            }
        };
        return new JsonResult(JsonSerializer.Serialize(result));
    }
}

public record OpcTag(object value, DateTime Timestamp);