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
                Data = new Dictionary<string, object> { 
                    { "ai1", 0.21},
                    { "ai2", 0.15},
                    { "ai3", 10 },
                    { "ai4", 0},
                    { "di1", false},
                    { "di2", true},
                }
            }
        };
        return Ok(JsonSerializer.Serialize(result));
    }
}