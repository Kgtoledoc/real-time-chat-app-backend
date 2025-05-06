pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-1' // Replace with your AWS region
        ECR_REPO = 'your-ecr-repo-name' // Replace with your ECR repository name
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        K8S_DEPLOYMENT = 'your-k8s-deployment-name' // Replace with your Kubernetes deployment name
        K8S_NAMESPACE = 'default' // Replace with your Kubernetes namespace
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${ECR_REPO}:${IMAGE_TAG} ."
                }
            }
        }

        stage('Login to ECR') {
            steps {
                script {
                    sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.${AWS_REGION}.amazonaws.com"
                }
            }
        }

        stage('Push to ECR') {
            steps {
                script {
                    sh "docker tag ${ECR_REPO}:${IMAGE_TAG} <AWS_ACCOUNT_ID>.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}"
                    sh "docker push <AWS_ACCOUNT_ID>.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}"
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    sh """
                    kubectl set image deployment/${K8S_DEPLOYMENT} ${K8S_DEPLOYMENT}=<AWS_ACCOUNT_ID>.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG} -n ${K8S_NAMESPACE}
                    kubectl rollout status deployment/${K8S_DEPLOYMENT} -n ${K8S_NAMESPACE}
                    """
                }
            }
        }
    }
}