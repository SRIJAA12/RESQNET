pipeline {
    agent any

    environment {
        DOCKER = '/usr/local/bin/docker'
        ANSIBLE_PLAYBOOK = '/opt/resqnet-ansible/deploy.yml'
        BACKEND_HEALTH_URL = 'http://localhost:8001/api/health'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Source code is checked out by Jenkins SCM.'
                sh '''
                    set -e
                    echo "Workspace: $WORKSPACE"
                    test -f "$WORKSPACE/backend/requirements.txt"
                    test -f "$WORKSPACE/docker-compose.yml" || \
                    test -f "$WORKSPACE/docker-compose.yaml" || \
                    test -f "$WORKSPACE/compose.yml" || \
                    test -f "$WORKSPACE/compose.yaml"
                '''
            }
        }

        stage('Backend Tests') {
            steps {
                sh '''
                    set -e

                    echo "Creating CI test Dockerfile..."
                    cat > "$WORKSPACE/backend/Dockerfile.ci" <<'EOF'
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir pytest

COPY . .

CMD ["python", "-m", "pytest", "-q", "tests"]
EOF

                    echo "Building backend test image..."
                    "$DOCKER" build \
                        -t resqnet-backend-ci:latest \
                        -f "$WORKSPACE/backend/Dockerfile.ci" \
                        "$WORKSPACE/backend"

                    echo "Running backend tests..."
                    "$DOCKER" run --rm \
                        resqnet-backend-ci:latest
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    set -e
                    cd "$WORKSPACE"

                    echo "Building RESQNET Compose services..."
                    "$DOCKER" compose build
                '''
            }
        }

        stage('Deploy with Ansible') {
            steps {
                sh '''
                    set -e

                    echo "Deploying RESQNET using Ansible..."
                    test -f "$ANSIBLE_PLAYBOOK"

                    WORKSPACE="$WORKSPACE" \
                    "$DOCKER" --version >/dev/null

                    WORKSPACE="$WORKSPACE" \
                    ansible-playbook \
                        -i localhost, \
                        -c local \
                        "$ANSIBLE_PLAYBOOK"
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    set -e

                    echo "Checking RESQNET backend health..."

                    for attempt in $(seq 1 12); do
                        if curl --fail --silent "$BACKEND_HEALTH_URL"; then
                            echo ""
                            echo "Backend health check passed."
                            exit 0
                        fi

                        echo "Health check attempt $attempt failed; retrying..."
                        sleep 5
                    done

                    echo "Backend health check failed."
                    exit 1
                '''
            }
        }
    }

    post {
        success {
            echo 'RESQNET CI/CD pipeline completed successfully.'
        }

        failure {
            echo 'RESQNET CI/CD pipeline failed. Check the stage logs.'
        }

        always {
            echo 'Pipeline execution finished.'
        }
    }
}
