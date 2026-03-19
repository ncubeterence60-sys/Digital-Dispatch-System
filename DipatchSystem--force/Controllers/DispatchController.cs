using Microsoft.AspNetCore.Mvc;
using DipatchSystem__force.Models;
using System.Collections.Generic;
namespace DipatchSystem__force.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DispatchController : ControllerBase
    {
        private readonly List<Dispatch> _dispatches;

        public DispatchController()
        {
            // Initialize with some sample data
            _dispatches = new List<Dispatch>
            {
                new Dispatch { Id = 1, Description = "Dispatch 1", Status = "Pending" },
                new Dispatch { Id = 2, Description = "Dispatch 2", Status = "In Progress" },
                new Dispatch { Id = 3, Description = "Dispatch 3", Status = "Completed" }
            };
        }

        [HttpGet]
        public ActionResult<IEnumerable<Dispatch>> GetAll()
        {
            return Ok(_dispatches);
        }

        [HttpGet("{id}")]
        public ActionResult<Dispatch> GetById(int id)
        {
            var dispatch = _dispatches.Find(d => d.Id == id);
            if (dispatch == null)
            {
                return NotFound();
            }
            return Ok(dispatch);
        }

        [HttpPost]
        public ActionResult Create(Dispatch newDispatch)
        {
            newDispatch.Id = _dispatches.Count + 1; // Simple ID generation
            _dispatches.Add(newDispatch);
            return CreatedAtAction(nameof(GetById), new { id = newDispatch.Id }, newDispatch);
        }

        [HttpPut("{id}")]
        public ActionResult Update(int id, Dispatch updatedDispatch)
        {
            var dispatch = _dispatches.Find(d => d.Id == id);
            if (dispatch == null)
            {
                return NotFound();
            }
            dispatch.Description = updatedDispatch.Description;
            dispatch.Status = updatedDispatch.Status;
            return NoContent();
        }

        [HttpDelete("{id}")]
        public ActionResult Delete(int id)
        {
            var dispatch = _dispatches.Find(d => d.Id == id);
            if (dispatch == null)
            {
                return NotFound();
            }
            _dispatches.Remove(dispatch);
            return NoContent();
        }
    }
}   

