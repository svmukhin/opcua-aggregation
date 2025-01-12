using Microsoft.AspNetCore.Mvc;
using OpcuaAggregationClient.Infrastructure;

namespace OpcuaAggregationClient.Controllers;

[ApiController]
[Route("/api/aggregation/status")]
public class StatusController: ControllerBase
{
    [HttpGet]
    public IActionResult GetSessionStatus([FromQuery]int? sessionId, [FromServices]UaClientManager uaClientManager)
    {
        if(sessionId is not null && sessionId > 0)
        {
            return new JsonResult(uaClientManager.GetClientStatusById(sessionId.Value));
        }

        return new JsonResult(uaClientManager.GetClientsStatus());
    }
}