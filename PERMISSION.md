**Managed Policy**

1. AmazonAPIGatewayAdministrator
2. AmazonEC2ContainerRegistryFullAccess
3. AmazonS3FullAccess
4. AWSCloudFormationFullAccess
5. AWSLambda_FullAccess
6. AmazonSSMFullAccess

**Inline Policy**

`{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "iam:PassRole",
                "iam:DetachRolePolicy",
                "iam:CreateRole",
                "iam:DeleteRole",
                "iam:AttachRolePolicy",
                "iam:PutGroupPolicy",
                "iam:TagRole",
                "iam:PutRolePolicy",
                "iam:GetRole"
            ],
            "Resource": [
                "arn:aws:iam::851725511052:group/*", // Add your ARN details here 
                "arn:aws:iam::851725211052:role/*"   // Add your ARN details here
            ]
        }
    ]
}`
