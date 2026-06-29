namespace CheckSalary.Application.Modules.SalarySubmission.DTOs
{
    public class SubmitSalaryRequest
    {
        public string Stack { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string City { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Level { get; set; } = "Middle";
        public int WorkExperience { get; set; }
        public int? Age { get; set; }
        public int? CompanySize { get; set; }
    }
}