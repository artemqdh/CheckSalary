using System.Net.Http.Json;
using System.Text.Json;
using CheckSalary.Application.Modules.SalarySubmission.Services;

namespace CheckSalary.Infrastructure.AI;

public class OllamaStackNormalizer : IStackNormalizer
{
    private readonly HttpClient _http;

    public OllamaStackNormalizer(HttpClient http)
    {
        _http = http;
    }

    public async Task<NormalizedStackResult> NormalizeAsync(string rawStack)
    {
        var prompt = $@"You are a programming language name normalizer. Your job is to identify the canonical name of a programming language from user input.

        Rules:
        - If the input is clearly a programming language, return its standard name
        - If the input is NOT a programming language, return the input unchanged with confidence 0.5
        - Be conservative: only normalize if you are sure

        Examples:
        Input: C-Sharp → {{""normalized"": ""C#"", ""confidence"": 0.97}}
        Input: csharp → {{""normalized"": ""C#"", ""confidence"": 0.95}}
        Input: .NET Core → {{""normalized"": ""C#"", ""confidence"": 0.85}}
        Input: JS → {{""normalized"": ""JavaScript"", ""confidence"": 0.90}}
        Input: Python → {{""normalized"": ""Python"", ""confidence"": 1.0}}
        Input: TypeScript → {{""normalized"": ""TypeScript"", ""confidence"": 1.0}}
        Input: React → {{""normalized"": ""React"", ""confidence"": 1.0}}
        Input: C++ → {{""normalized"": ""C++"", ""confidence"": 1.0}}
        Input: Cplus → {{""normalized"": ""C++"", ""confidence"": 0.85}}

        Now normalize this input. Return ONLY a JSON object, nothing else:
        Input: {rawStack}";

        var request = new
        {
            model = "llama3.2:1b",
            prompt = prompt,
            stream = false,
            options = new { temperature = 0.1 }
        };

        try
        {
            var response = await _http.PostAsJsonAsync("http://localhost:11434/api/generate", request);
            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<OllamaResponse>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (result?.Response is not null)
            {
                var cleaned = ExtractJson(result.Response);
                var normalized = JsonSerializer.Deserialize<NormalizedResponse>(cleaned, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (normalized is not null)
                    return new NormalizedStackResult(normalized.Normalized, normalized.Confidence);
            }
        }
        catch
        {
            
        }

        return new NormalizedStackResult(rawStack, 0.5);
    }

    private static string ExtractJson(string text)
    {
        var start = text.IndexOf('{');
        var end = text.LastIndexOf('}');
        if (start >= 0 && end > start) return text[start..(end + 1)];
        return "{}";
    }

    private class OllamaResponse
    {
        public string? Response { get; set; }
    }

    private class NormalizedResponse
    {
        public string Normalized { get; set; } = string.Empty;
        public double Confidence { get; set; }
    }
}