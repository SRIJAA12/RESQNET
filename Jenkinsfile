pipeline {
    agent any

    environment {
        DOCKER = '/usr/local/bin/docker'
        ANSIBLE_PLAYBOOK = '/opt/resqnet-ansible/deploy.yml'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Source code is checked out by Jenkins SCM.'
            }
        }
        stage('Debug Workspace') {
 	   steps {
              sh '''
            	echo "Jenkins workspace: $WORKSPACE"
            	echo "Backend directory on Jenkins host:"
            	ls -la "$WORKSPACE/backend"

            	echo "Checking requirements file inside Docker:"
            	/usr/local/bin/docker run --rm \
              	-v "$WORKSPACE/backend:/app" \
              	-w /app \
              	python:3.11-slim \
              	sh -c 'pwd; ls -la /app; test -f /app/requirements.txt'
        '''
    		}
	}

        stage('Backend Tests') {
            steps {
                sh '''
                    /usr/local/bin/docker run --rm \
                      -v "$WORKSPACE/backend:/app" \
                      -w /app \
                      python:3.11-slim \
        	              sh -c "set -e; \
                        apt-get update; \
                        DEBIAN_FRONTEND=noninteractive apt-get install -y gcc libpq-dev; \
                        pip install -r /app/requirements.txt; \
                        pytest -q /app/tests"
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    set -e
                    echo "Validating Docker Compose configuration..."
                    ${DOCKER} compose config

                    echo "Building RESQNET Docker images..."
                    ${DOCKER} compose build
                '''
            }
        }

        stage('Deploy with Ansible') {
            steps {
                sh '''
                    set -e
                    echo "Deploying RESQNET using Ansible..."
                    ansible-playbook -i localhost, -c local "$ANSIBLE_PLAYBOOK"
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    set -e
                    echo "Checking RESQNET backend health..."

                    for i in $(seq 1 12); do
                        if curl --fail --silent http://localhost:8001/api/health; then
                            echo
                            echo "RESQNET backend health check passed."
                            exit 0
                        fi

                        echo "Backend not ready yet. Retrying in 5 seconds..."
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
            echo 'RESQNET CI/CD pipeline completed successfully!'
        }

        failure {
            echo 'RESQNET CI/CD pipeline failed. Check the stage logs.'
        }

        always {
            echo 'Pipeline execution finished.'
        }
    }
}
