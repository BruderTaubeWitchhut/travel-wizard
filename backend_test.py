#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
from typing import Dict, List, Any

class TravelWizardAPITester:
    def __init__(self, base_url="https://journeymate-51.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
        
        # Test data
        self.test_user_id = f"test_user_{datetime.now().strftime('%H%M%S')}"
        self.test_group_id = None
        self.test_booking_id = None
        self.test_session_id = None

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    Details: {details}")
        
        if success:
            self.tests_passed += 1
        else:
            self.failed_tests.append({"test": name, "details": details})

    def test_health_check(self):
        """Test API health check"""
        try:
            response = self.session.get(f"{self.base_url}/api/health")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Response: {data.get('status', 'unknown')}"
            self.log_test("Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
            return False

    def test_user_registration(self):
        """Test user registration"""
        try:
            user_data = {
                "uid": self.test_user_id,
                "email": f"{self.test_user_id}@test.com",
                "name": f"Test User {self.test_user_id}"
            }
            
            response = self.session.post(f"{self.base_url}/api/auth/register", json=user_data)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                details += f", User ID: {data.get('user_id', 'N/A')}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("User Registration", success, details)
            return success
        except Exception as e:
            self.log_test("User Registration", False, f"Exception: {str(e)}")
            return False

    def test_mood_discovery(self):
        """Test mood-based destination discovery"""
        try:
            mood_data = {
                "prompt": "I want adventure and thrill 🎢",
                "user_id": self.test_user_id
            }
            
            response = self.session.post(f"{self.base_url}/api/mood-discovery", json=mood_data)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                destinations_count = len(data) if isinstance(data, list) else 0
                details += f", Destinations returned: {destinations_count}"
                
                # Validate destination structure
                if destinations_count > 0:
                    first_dest = data[0]
                    required_fields = ['name', 'description', 'image_url', 'reasons']
                    missing_fields = [field for field in required_fields if field not in first_dest]
                    if missing_fields:
                        success = False
                        details += f", Missing fields: {missing_fields}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Mood Discovery", success, details)
            return success
        except Exception as e:
            self.log_test("Mood Discovery", False, f"Exception: {str(e)}")
            return False

    def test_create_group(self):
        """Test creating a travel group"""
        try:
            group_data = {
                "name": f"Test Group {datetime.now().strftime('%H%M%S')}",
                "creator_id": self.test_user_id
            }
            
            response = self.session.post(f"{self.base_url}/api/groups", json=group_data)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                self.test_group_id = data.get('id')
                group_code = data.get('code')
                details += f", Group ID: {self.test_group_id}, Code: {group_code}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Create Group", success, details)
            return success
        except Exception as e:
            self.log_test("Create Group", False, f"Exception: {str(e)}")
            return False

    def test_get_user_groups(self):
        """Test getting user groups"""
        try:
            response = self.session.get(f"{self.base_url}/api/groups/{self.test_user_id}")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                groups_count = len(data) if isinstance(data, list) else 0
                details += f", Groups found: {groups_count}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Get User Groups", success, details)
            return success
        except Exception as e:
            self.log_test("Get User Groups", False, f"Exception: {str(e)}")
            return False

    def test_create_booking(self):
        """Test creating a trip booking"""
        try:
            booking_data = {
                "user_id": self.test_user_id,
                "destination": "Test Destination",
                "start_date": "2024-12-01",
                "end_date": "2024-12-07",
                "activities": ["Sightseeing", "Adventure Sports"]
            }
            
            response = self.session.post(f"{self.base_url}/api/bookings", json=booking_data)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                self.test_booking_id = data.get('id')
                details += f", Booking ID: {self.test_booking_id}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Create Booking", success, details)
            return success
        except Exception as e:
            self.log_test("Create Booking", False, f"Exception: {str(e)}")
            return False

    def test_get_user_bookings(self):
        """Test getting user bookings"""
        try:
            response = self.session.get(f"{self.base_url}/api/bookings/{self.test_user_id}")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                bookings_count = len(data) if isinstance(data, list) else 0
                details += f", Bookings found: {bookings_count}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Get User Bookings", success, details)
            return success
        except Exception as e:
            self.log_test("Get User Bookings", False, f"Exception: {str(e)}")
            return False

    def test_chat_functionality(self):
        """Test AI chat functionality"""
        try:
            chat_data = {
                "message": "What are some good travel destinations for adventure?",
                "user_id": self.test_user_id,
                "session_id": None
            }
            
            response = self.session.post(f"{self.base_url}/api/chat", json=chat_data)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                self.test_session_id = data.get('session_id')
                response_text = data.get('response', '')
                details += f", Session ID: {self.test_session_id}, Response length: {len(response_text)}"
                
                # Check if response is meaningful
                if len(response_text) < 10:
                    success = False
                    details += ", Response too short"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Chat Functionality", success, details)
            return success
        except Exception as e:
            self.log_test("Chat Functionality", False, f"Exception: {str(e)}")
            return False

    def test_dashboard_data(self):
        """Test dashboard data retrieval"""
        try:
            response = self.session.get(f"{self.base_url}/api/dashboard/{self.test_user_id}")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                bookings = data.get('bookings', [])
                groups = data.get('groups', [])
                daily_digest = data.get('daily_digest', {})
                
                details += f", Bookings: {len(bookings)}, Groups: {len(groups)}"
                details += f", Daily digest keys: {list(daily_digest.keys())}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Dashboard Data", success, details)
            return success
        except Exception as e:
            self.log_test("Dashboard Data", False, f"Exception: {str(e)}")
            return False

    def test_vote_activity(self):
        """Test voting on group activities"""
        if not self.test_group_id:
            self.log_test("Vote Activity", False, "No group ID available for testing")
            return False
            
        try:
            vote_data = {
                "group_id": self.test_group_id,
                "activity_name": "Beach Volleyball",
                "user_id": self.test_user_id
            }
            
            response = self.session.post(f"{self.base_url}/api/groups/{self.test_group_id}/vote", json=vote_data)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'N/A')}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Vote Activity", success, details)
            return success
        except Exception as e:
            self.log_test("Vote Activity", False, f"Exception: {str(e)}")
            return False

    def test_get_group_votes(self):
        """Test getting group votes"""
        if not self.test_group_id:
            self.log_test("Get Group Votes", False, "No group ID available for testing")
            return False
            
        try:
            response = self.session.get(f"{self.base_url}/api/groups/{self.test_group_id}/votes")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                votes_count = len(data) if isinstance(data, list) else 0
                details += f", Votes found: {votes_count}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Get Group Votes", success, details)
            return success
        except Exception as e:
            self.log_test("Get Group Votes", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting TRAVEL-WIZARD API Tests")
        print("=" * 50)
        
        # Test order matters - some tests depend on previous ones
        test_methods = [
            self.test_health_check,
            self.test_user_registration,
            self.test_mood_discovery,
            self.test_create_group,
            self.test_get_user_groups,
            self.test_vote_activity,
            self.test_get_group_votes,
            self.test_create_booking,
            self.test_get_user_bookings,
            self.test_dashboard_data,
            self.test_chat_functionality,
        ]
        
        for test_method in test_methods:
            test_method()
            print()  # Add spacing between tests
        
        # Print summary
        print("=" * 50)
        print(f"📊 Test Summary:")
        print(f"   Total Tests: {self.tests_run}")
        print(f"   Passed: {self.tests_passed}")
        print(f"   Failed: {len(self.failed_tests)}")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for failed_test in self.failed_tests:
                print(f"   - {failed_test['test']}: {failed_test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = TravelWizardAPITester()
    success = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())