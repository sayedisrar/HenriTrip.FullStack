using System;
using System.Collections.Generic;
using System.Text;

namespace HenriTrips.Application.Common
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string? Message { get; set; }
    }
}
