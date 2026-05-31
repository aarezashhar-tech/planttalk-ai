import india_forecast
import json

result = india_forecast.generate_india_forecast()
print(json.dumps(result, indent=2))
