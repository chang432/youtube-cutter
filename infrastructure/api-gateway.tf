resource "aws_apigatewayv2_api" "default" {
  name = "default-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "default_api" {
  api_id = aws_apigatewayv2_api.default.id
  name   = "api"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = 10
    throttling_rate_limit  = 10
  }
}

resource "aws_apigatewayv2_integration" "lambda_rest_api" {
  api_id           = aws_apigatewayv2_api.default.id
  integration_type = "AWS_PROXY"

  integration_method = "POST"
  integration_uri    = aws_lambda_function.rest_api.invoke_arn
}

resource "aws_apigatewayv2_route" "proxy" {
  api_id    = aws_apigatewayv2_api.default.id
  route_key = "ANY /{proxy+}"

  target = "integrations/${aws_apigatewayv2_integration.lambda_rest_api.id}"
}

resource "aws_lambda_permission" "rest_api" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.rest_api.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.default.execution_arn}/*/*"
}