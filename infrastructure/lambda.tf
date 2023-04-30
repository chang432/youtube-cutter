resource "aws_lambda_function" "rest_api" {
  function_name = "rest_api"

  s3_bucket = aws_s3_bucket.backend.bucket
  s3_key    = "${var.deployment_number}/rest_api.zip"

  handler = "index.handler"
  runtime = "nodejs14.x"

  role = aws_iam_role.lambda_rest_api.arn
}

resource "aws_iam_role" "lambda_rest_api" {
  name = "lambda_rest_api"

  assume_role_policy = <<EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Effect": "Allow",
        "Sid": ""
      }
    ]
  }
  EOF

}

data "aws_iam_policy" "AWSLambdaBasicExecutionRole" {
  arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "AWSLambdaBasicExecutionRole_to_lambda_rest_api" {
  policy_arn = data.aws_iam_policy.AWSLambdaBasicExecutionRole.arn
  role = aws_iam_role.lambda_rest_api.name
}